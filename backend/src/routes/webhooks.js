const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuration n8n
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/document-conversion';
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

// Middleware pour valider le webhook secret (optionnel)
const validateWebhookSecret = (req, res, next) => {
  if (N8N_WEBHOOK_SECRET) {
    const providedSecret = req.headers['x-webhook-secret'];
    if (providedSecret !== N8N_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
  }
  next();
};

/**
 * POST /api/webhooks/trigger-conversion
 * Déclenche la conversion PDF d'un document via n8n
 */
router.post('/trigger-conversion', validateWebhookSecret, async (req, res) => {
  try {
    const { documentId, fileUrl, fileName, mimeType, userId } = req.body;

    // Validation des données requises
    if (!documentId || !fileUrl || !mimeType) {
      return res.status(400).json({
        error: 'Missing required fields: documentId, fileUrl, mimeType'
      });
    }

    console.log(`Triggering PDF conversion for document ${documentId}`);

    // Payload pour n8n
    const webhookPayload = {
      documentId,
      fileUrl,
      fileName: fileName || 'unknown',
      mimeType,
      userId,
      timestamp: new Date().toISOString(),
      source: 'docvault-backend',
      conversionOptions: {
        quality: 'default', // low, default, high
        optimize: true
      }
    };

    // Appel du webhook n8n
    const response = await axios.post(N8N_WEBHOOK_URL, webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DocVault-Backend/1.0'
      },
      timeout: 10000 // 10 secondes timeout
    });

    console.log('n8n webhook response:', response.status, response.data);

    res.json({
      success: true,
      message: 'Conversion triggered successfully',
      workflowId: response.data?.workflowId,
      executionId: response.data?.executionId
    });

  } catch (error) {
    console.error('Error triggering conversion:', error.message);
    
    // Différencier les erreurs
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'n8n service unavailable',
        details: 'Could not connect to n8n webhook'
      });
    }
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'n8n webhook error',
        details: error.response.data || error.message
      });
    }

    res.status(500).json({
      error: 'Failed to trigger conversion',
      details: error.message
    });
  }
});

/**
 * POST /api/webhooks/conversion-status
 * Callback depuis n8n pour mettre à jour le statut de conversion
 */
router.post('/conversion-status', validateWebhookSecret, async (req, res) => {
  try {
    const { documentId, status, pdfUrl, error: conversionError } = req.body;

    if (!documentId || !status) {
      return res.status(400).json({
        error: 'Missing required fields: documentId, status'
      });
    }

    console.log(`Updating conversion status for document ${documentId}: ${status}`);

    const supabase = require('../config/supabase');

    // Préparer les données de mise à jour
    const updateData = {
      conversion_status: status,
      updated_at: new Date().toISOString()
    };

    // Ajouter des champs conditionnels
    if (status === 'completed' && pdfUrl) {
      updateData.converted_pdf_url = pdfUrl;
      updateData.converted_at = new Date().toISOString();
      updateData.conversion_error = null; // Clear previous errors
    } else if (status === 'failed' && conversionError) {
      updateData.conversion_error = conversionError;
    }

    // Mettre à jour la base de données
    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({
        error: 'Failed to update document status',
        details: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    console.log(`Document ${documentId} status updated successfully`);

    res.json({
      success: true,
      message: 'Status updated successfully',
      document: data[0]
    });

  } catch (error) {
    console.error('Error updating conversion status:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * GET /api/webhooks/conversion-status/:documentId
 * Obtenir le statut de conversion d'un document
 */
router.get('/conversion-status/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const supabase = require('../config/supabase');

    const { data, error } = await supabase
      .from('documents')
      .select('conversion_status, converted_pdf_url, conversion_error, converted_at')
      .eq('id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Document not found' });
      }
      throw error;
    }

    res.json({
      success: true,
      documentId,
      status: data.conversion_status,
      pdfUrl: data.converted_pdf_url,
      error: data.conversion_error,
      convertedAt: data.converted_at
    });

  } catch (error) {
    console.error('Error fetching conversion status:', error);
    res.status(500).json({
      error: 'Failed to fetch conversion status',
      details: error.message
    });
  }
});

/**
 * POST /api/webhooks/retry-conversion/:documentId
 * Relancer la conversion d'un document
 */
router.post('/retry-conversion/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const supabase = require('../config/supabase');

    // Récupérer les informations du document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Réinitialiser le statut à pending
    await supabase
      .from('documents')
      .update({
        conversion_status: 'pending',
        conversion_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    // Déclencher à nouveau la conversion
    const webhookPayload = {
      documentId: document.id,
      fileUrl: document.file_path,
      fileName: document.title,
      mimeType: document.mime_type,
      userId: document.user_id,
      timestamp: new Date().toISOString(),
      source: 'docvault-retry'
    };

    await axios.post(N8N_WEBHOOK_URL, webhookPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'Conversion retry triggered successfully'
    });

  } catch (error) {
    console.error('Error retrying conversion:', error);
    res.status(500).json({
      error: 'Failed to retry conversion',
      details: error.message
    });
  }
});

module.exports = router;