const supabase = require('../config/supabase');

class AuthController {
  async signUp({ email, password, fullName }) {
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || ''
          }
        }
      });

      if (error) {
        throw error;
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName || '',
            subscription_tier: 'free'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return {
        user: data.user,
        session: data.session,
        message: 'Account created successfully. Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('SignUp error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return {
        user: data.user,
        session: data.session,
        message: 'Successfully signed in'
      };
    } catch (error) {
      console.error('SignIn error:', error);
      throw new Error(error.message || 'Invalid credentials');
    }
  }

  async signOut(req) {
    try {
      // MVP: Server-side signOut not possible with service role
      // Token invalidation is handled client-side
      // Just return success for MVP
      return { message: 'Successfully signed out' };
    } catch (error) {
      console.error('SignOut error:', error);
      throw new Error('Failed to sign out');
    }
  }

  async resetPassword({ email }) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/auth/update-password`
      });

      if (error) {
        throw error;
      }

      return {
        message: 'Password reset email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async updatePassword({ password }, req) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        throw new Error('No authentication token provided');
      }

      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw error;
      }

      return {
        user: data.user,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }
}

module.exports = new AuthController();