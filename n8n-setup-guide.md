# Guide d'Installation et Configuration n8n pour DocVault

## 🎯 Objectif
Configurer n8n pour automatiser la conversion de documents en PDF lors de l'upload dans DocVault.

## 📋 Prérequis
- Docker et Docker Compose installés
- Accès à l'instance Supabase
- Node.js 16+ pour les tests locaux

## 🚀 Installation n8n

### Option 1: Docker Compose (Recommandé)

Créer un fichier `docker-compose.n8n.yml` :

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: docvault-n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=docvault2024
      - N8N_ENCRYPTION_KEY=your-encryption-key-here
      - WEBHOOK_URL=http://localhost:5678
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
    volumes:
      - n8n_data:/home/node/.n8n
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped

volumes:
  n8n_data:
```

Démarrer n8n :
```bash
docker-compose -f docker-compose.n8n.yml up -d
```

### Option 2: Installation locale

```bash
npm install -g n8n
n8n start --tunnel
```

## 🔧 Configuration n8n

### 1. Accéder à l'interface
- URL: http://localhost:5678
- Login: admin / docvault2024

### 2. Installer les packages nécessaires
Ajouter ces packages dans n8n :
- `@n8n/nodes-base` (déjà inclus)
- LibreOffice (pour conversion)
- Webhook nodes

### 3. Configurer les Credentials

#### Supabase Credential
1. Aller dans Settings > Credentials
2. Ajouter "HTTP Request" credential :
   - Name: `Supabase-DocVault`
   - URL: `https://your-project.supabase.co`
   - Headers:
     ```json
     {
       "apikey": "your-supabase-anon-key",
       "Authorization": "Bearer your-supabase-service-role-key"
     }
     ```

## 📄 Workflow de Conversion PDF

### Architecture du Workflow

```
Webhook (Trigger) 
    ↓
Download File from Supabase Storage
    ↓
Convert to PDF (LibreOffice/Pandoc)
    ↓
Upload PDF to Supabase Storage
    ↓
Update Database (conversion status)
    ↓
Send Notification (optionnel)
```

### Configuration des Nodes

#### 1. Webhook Trigger
- URL: `http://localhost:5678/webhook/document-conversion`
- Method: POST
- Authentication: None (peut être sécurisé plus tard)

#### 2. Download Original File
- Node Type: HTTP Request
- Method: GET
- URL: `{{ $json.fileUrl }}`
- Headers:
  ```json
  {
    "Authorization": "Bearer your-supabase-anon-key"
  }
  ```

#### 3. PDF Conversion
- Node Type: Code (JavaScript)
- Utiliser LibreOffice via exec ou Docker

#### 4. Upload PDF
- Node Type: HTTP Request
- Method: POST
- URL: Supabase Storage endpoint

#### 5. Update Database
- Node Type: HTTP Request
- Method: POST
- URL: Supabase REST API
- Body: Mise à jour du statut de conversion

## 🛠 Commandes Docker pour LibreOffice

### Dockerfile pour conversion PDF

```dockerfile
FROM n8nio/n8n:latest

USER root

# Installer LibreOffice
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-liberation \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

USER node
```

Build l'image personnalisée :
```bash
docker build -t docvault-n8n-pdf .
```

Modifier le docker-compose.yml :
```yaml
services:
  n8n:
    image: docvault-n8n-pdf:latest
    # ... reste de la config
```

## 🔗 Intégration avec DocVault Backend

### Webhook à ajouter dans le backend

```javascript
// backend/src/routes/webhooks.js
router.post('/trigger-conversion', async (req, res) => {
  const { documentId, fileUrl, mimeType } = req.body;
  
  try {
    // Appeler n8n
    const response = await axios.post('http://localhost:5678/webhook/document-conversion', {
      documentId,
      fileUrl,
      mimeType,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, workflowId: response.data.workflowId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger conversion' });
  }
});
```

## 📊 Monitoring et Logs

### Variables d'environnement pour monitoring
```env
N8N_METRICS=true
N8N_LOG_LEVEL=debug
N8N_LOG_OUTPUT=console,file
```

### Vérifier les logs
```bash
docker logs docvault-n8n -f
```

## 🧪 Tests

### Test du webhook
```bash
curl -X POST http://localhost:5678/webhook/document-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "123e4567-e89b-12d3-a456-426614174000",
    "fileUrl": "https://your-project.supabase.co/storage/v1/object/documents/test.docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }'
```

## 🔒 Sécurité

### Authentification webhook
1. Générer un token secret
2. Ajouter la validation dans n8n
3. Utiliser HTTPS en production

### Variables d'environnement sécurisées
```env
N8N_ENCRYPTION_KEY=your-very-secure-encryption-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WEBHOOK_SECRET=your-webhook-secret
```

## 🚀 Déploiement en Production

### Recommandations
1. Utiliser un serveur dédié ou VPS
2. Configurer un reverse proxy (Nginx)
3. Utiliser HTTPS avec Let's Encrypt
4. Monitorer avec Prometheus/Grafana
5. Backup régulier des workflows n8n

### Configuration Nginx
```nginx
server {
    listen 80;
    server_name n8n.docvault.com;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 Formats supportés pour conversion

- **Documents:** .docx, .doc, .odt, .rtf
- **Feuilles de calcul:** .xlsx, .xls, .ods
- **Présentations:** .pptx, .ppt, .odp
- **Images:** .png, .jpg, .jpeg (via ImageMagick)
- **Texte:** .txt, .md

## 🆘 Dépannage

### Problèmes courants
1. **LibreOffice ne démarre pas:** Vérifier les permissions
2. **Conversion échoue:** Vérifier le format du fichier source
3. **Webhook timeout:** Augmenter le timeout n8n
4. **Erreur Supabase:** Vérifier les credentials et permissions

### Logs utiles
```bash
# Logs n8n
docker logs docvault-n8n

# Logs LibreOffice
docker exec docvault-n8n libreoffice --version

# Test conversion manuelle
docker exec docvault-n8n libreoffice --headless --convert-to pdf /tmp/test.docx
```