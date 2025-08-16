const supabase = require('../config/supabase');
const crypto = require('crypto');
const axios = require('axios');

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
          tags: tags || [],
          is_encrypted: true,
          conversion_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if document creation fails
        await supabase.storage.from('documents').remove([fileName]);
        throw error;
      }

      // Déclencher la conversion PDF via n8n (de manière asynchrone)
      this.triggerPdfConversion(data, uploadData.path).catch(error => {
        console.error('Failed to trigger PDF conversion:', error.message);
        // Mettre à jour le statut en cas d'échec du trigger
        supabase
          .from('documents')
          .update({ 
            conversion_status: 'failed',
            conversion_error: 'Failed to trigger conversion: ' + error.message
          })
          .eq('id', data.id)
          .then(() => console.log(`Document ${data.id} marked as conversion failed`));
      });

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

  // MVP: Share functionality removed

  /**
   * Déclenche la conversion PDF via n8n
   */
  async triggerPdfConversion(document, filePath) {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/document-conversion';
    
    try {
      // Construire l'URL publique du fichier
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const webhookPayload = {
        documentId: document.id,
        fileUrl: publicUrl,
        fileName: document.title,
        mimeType: document.mime_type,
        userId: document.user_id,
        timestamp: new Date().toISOString(),
        source: 'docvault-upload'
      };

      console.log(`Triggering PDF conversion for document ${document.id}`);

      const response = await axios.post(N8N_WEBHOOK_URL, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DocVault-Backend/1.0'
        },
        timeout: 10000
      });

      console.log(`PDF conversion triggered successfully for document ${document.id}`);
      return response.data;

    } catch (error) {
      console.error(`Failed to trigger PDF conversion for document ${document.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de conversion pour un utilisateur
   */
  async getConversionStats(userId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('conversion_status')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(d => d.conversion_status === 'pending').length,
        converting: data.filter(d => d.conversion_status === 'converting').length,
        completed: data.filter(d => d.conversion_status === 'completed').length,
        failed: data.filter(d => d.conversion_status === 'failed').length
      };

      stats.success_rate = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;

      return stats;
    } catch (error) {
      console.error('Get conversion stats error:', error);
      throw new Error('Failed to get conversion statistics');
    }
  }
}

module.exports = new DocumentController();