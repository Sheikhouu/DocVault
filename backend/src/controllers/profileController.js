const supabase = require('../config/supabase');

class ProfileController {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(userId, updates) {
    try {
      const allowedFields = ['full_name', 'avatar_url'];
      const filteredUpdates = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(filteredUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  async getUserStats(userId) {
    try {
      // Get documents count
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get documents by category
      const { data: categoryStats } = await supabase
        .from('documents')
        .select('category')
        .eq('user_id', userId);

      const categoryCounts = categoryStats?.reduce((acc, doc) => {
        const category = doc.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get storage usage
      const { data: documents } = await supabase
        .from('documents')
        .select('file_size')
        .eq('user_id', userId);

      const totalStorage = documents?.reduce((total, doc) => total + (doc.file_size || 0), 0) || 0;

      // Get expiring documents (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { count: expiringCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', thirtyDaysFromNow.toISOString());

      return {
        documentsCount: documentsCount || 0,
        categoryCounts,
        totalStorageBytes: totalStorage,
        expiringDocuments: expiringCount || 0
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      throw new Error('Failed to fetch statistics');
    }
  }
}

module.exports = new ProfileController();