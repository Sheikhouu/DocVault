const supabase = require('../config/supabase');
const crypto = require('crypto');

class DocumentController {
  async getDocuments(userId, query = {}) {
    try {
      let supabaseQuery = supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (query.category) {
        supabaseQuery = supabaseQuery.eq('category', query.category);
      }

      if (query.search) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query.search}%,description.ilike.%${query.search}%`);
      }

      if (query.tags) {
        const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
        supabaseQuery = supabaseQuery.overlaps('tags', tags);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get documents error:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  async getDocument(documentId, userId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get document error:', error);
      return null;
    }
  }

  async createDocument({ title, description, category, expiry_date, tags, file, userId }) {
    try {
      // Check user's document limit (freemium)
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get user profile to check subscription
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (profile?.subscription_tier === 'free' && count >= 5) {
        throw new Error('Free tier limit reached. Please upgrade to continue.');
      }

      // Upload file to Supabase Storage
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExtension}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          title,
          description,
          category,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.mimetype,
          expiry_date: expiry_date ? new Date(expiry_date).toISOString() : null,
          tags: tags || [],
          is_encrypted: true
        })
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if document creation fails
        await supabase.storage.from('documents').remove([fileName]);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Create document error:', error);
      throw new Error(error.message || 'Failed to create document');
    }
  }

  async updateDocument(documentId, updates, userId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update document error:', error);
      throw new Error('Failed to update document');
    }
  }

  async deleteDocument(documentId, userId) {
    try {
      // Get document to delete file from storage
      const document = await this.getDocument(documentId, userId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Delete file from storage
      if (document.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (storageError) {
          console.error('Storage delete error:', storageError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Delete document error:', error);
      throw new Error('Failed to delete document');
    }
  }

  async generateShareLink(documentId, userId, expiresIn = '24h') {
    try {
      // Verify document belongs to user
      const document = await this.getDocument(documentId, userId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Generate share token
      const shareToken = crypto.randomUUID();
      const expiresAt = new Date();
      
      // Parse expiresIn (e.g., "24h", "7d", "1w")
      const timeMatch = expiresIn.match(/^(\d+)([hdw])$/);
      if (timeMatch) {
        const [, amount, unit] = timeMatch;
        const multiplier = { h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000, w: 7 * 24 * 60 * 60 * 1000 };
        expiresAt.setTime(expiresAt.getTime() + (parseInt(amount) * multiplier[unit]));
      } else {
        expiresAt.setTime(expiresAt.getTime() + (24 * 60 * 60 * 1000)); // Default 24h
      }

      // Store share token in database (you might want to create a shares table)
      // For now, we'll return the token directly
      
      return `${shareToken}-${documentId}-${expiresAt.getTime()}`;
    } catch (error) {
      console.error('Generate share link error:', error);
      throw new Error('Failed to generate share link');
    }
  }
}

module.exports = new DocumentController();