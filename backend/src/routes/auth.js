const express = require('express');
const { z } = require('zod');
const supabase = require('../config/supabase');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional()
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const resetPasswordSchema = z.object({
  email: z.string().email()
});

// Routes
router.post('/signup', async (req, res) => {
  try {
    const validatedData = signUpSchema.parse(req.body);
    const result = await authController.signUp(validatedData);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const validatedData = signInSchema.parse(req.body);
    const result = await authController.signIn(validatedData);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Signin error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/signout', async (req, res) => {
  try {
    await authController.signOut(req);
    res.json({ message: 'Successfully signed out' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Failed to sign out' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const result = await authController.resetPassword(validatedData);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.post('/update-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const result = await authController.updatePassword({ password }, req);
    res.json(result);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;