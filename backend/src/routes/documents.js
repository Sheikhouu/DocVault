const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const authMiddleware = require('../middleware/auth');
const documentController = require('../controllers/documentController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Validation schemas
const documentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  expiry_date: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', async (req, res) => {
  try {
    const documents = await documentController.getDocuments(req.user.id, req.query);
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const document = await documentController.getDocument(req.params.id, req.user.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const validatedData = documentSchema.parse(JSON.parse(req.body.metadata || '{}'));
    
    const document = await documentController.createDocument({
      ...validatedData,
      file: req.file,
      userId: req.user.id
    });

    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const validatedData = documentSchema.partial().parse(req.body);
    const document = await documentController.updateDocument(req.params.id, validatedData, req.user.id);
    res.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await documentController.deleteDocument(req.params.id, req.user.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Generate share link
router.post('/:id/share', async (req, res) => {
  try {
    const { expiresIn } = req.body;
    const shareToken = await documentController.generateShareLink(req.params.id, req.user.id, expiresIn);
    res.json({ shareToken });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

module.exports = router;