# ⚙️ Guide Développeur 3 - Backend API & Intégration

## 👤 **Votre Mission (Sheikhouu)**
Vous êtes le **chef technique** responsable de l'**API Backend** et de l'**intégration** Frontend/Backend. Vous orchestrez la communication entre les composants.

## 🌳 **Vos Branches Git**
```bash
# Créer et basculer sur vos branches
git checkout -b feature/backend-api
git checkout -b feature/integration

# Pour changer de branche
git checkout feature/backend-api
git checkout feature/integration
```

## 📁 **Vos Zones de Travail**

### **1. Backend API (Priorité #1)**
```
backend/src/
├── controllers/
│   ├── authController.js      🎯 Authentification
│   ├── documentController.js  🎯 Gestion documents
│   └── profileController.js   🎯 Profils utilisateurs
├── routes/
│   ├── auth.js               🎯 Routes auth
│   ├── documents.js          🎯 Routes documents
│   └── profiles.js           🎯 Routes profils
├── middleware/
│   └── auth.js               🎯 Sécurité
├── services/                 🎯 À créer
└── utils/                    🎯 Utilitaires
```

### **2. Services Frontend (Priorité #2)**
```
frontend/src/services/
└── api.ts                    🎯 Client API Axios

frontend/src/lib/
├── auth.ts                   🎯 Gestion auth frontend
└── hooks/
    ├── use-freemium.ts      🎯 Logique freemium
    └── use-reminders.ts     🎯 Gestion rappels
```

### **3. Configuration & Déploiement**
```
backend/.env                  🎯 Variables environnement
backend/package.json          🎯 Dépendances
frontend/.env.local          🎯 Config frontend
```

## 🎯 **Tâches Prioritaires - Semaine 1**

### **Jour 1-2 : Backend API Robuste**
- [ ] **Finaliser les Controllers**
  - Validation complète avec Zod
  - Gestion d'erreurs appropriée
  - Logs et monitoring

- [ ] **Sécurisation API**
  - Middleware d'authentification bulletproof
  - Rate limiting et protection CORS
  - Validation des permissions utilisateur

### **Jour 3-4 : Services & Intégration**
- [ ] **Services métier**
  - Service de gestion de fichiers
  - Service de notifications
  - Service de rapports/statistiques

- [ ] **Client API Frontend**
  - Service Axios optimisé
  - Gestion des erreurs centralisée
  - Cache et optimisations

### **Jour 5-7 : Tests & Documentation**
- [ ] **Tests API**
  - Tests unitaires des controllers
  - Tests d'intégration
  - Documentation OpenAPI/Swagger

## 🚀 **Architecture Backend Avancée**

### **1. Structure Controllers Optimisée**

```javascript
// backend/src/controllers/documentController.js
const documentService = require('../services/documentService');
const { validateDocument } = require('../utils/validators');
const logger = require('../utils/logger');

class DocumentController {
  async createDocument(req, res) {
    try {
      // Validation des données
      const validatedData = await validateDocument(req.body);
      
      // Vérification des permissions
      await this.checkUserPermissions(req.user.id, 'document:create');
      
      // Logique métier déléguée au service
      const document = await documentService.create({
        ...validatedData,
        file: req.file,
        userId: req.user.id
      });

      logger.info(`Document créé: ${document.id} par ${req.user.id}`);
      
      res.status(201).json({
        success: true,
        data: document,
        message: 'Document créé avec succès'
      });
    } catch (error) {
      logger.error('Erreur création document:', error);
      this.handleError(res, error);
    }
  }

  async getDocuments(req, res) {
    try {
      const { page = 1, limit = 20, category, search } = req.query;
      
      const documents = await documentService.getUserDocuments(req.user.id, {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        search
      });

      res.json({
        success: true,
        data: documents.items,
        pagination: {
          page: documents.page,
          pages: documents.pages,
          total: documents.total
        }
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.details
      });
    }

    if (error.name === 'UnauthorizedError') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
}

module.exports = new DocumentController();
```

### **2. Service Layer (À Créer)**

```javascript
// backend/src/services/documentService.js
const supabase = require('../config/supabase');
const fileService = require('./fileService');
const notificationService = require('./notificationService');

class DocumentService {
  async create({ title, description, category, file, userId }) {
    // 1. Vérifier les limites freemium
    await this.checkUserLimits(userId);

    // 2. Upload du fichier
    const filePath = await fileService.uploadFile(file, userId);

    // 3. Création en base
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.mimetype,
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Notification
    await notificationService.send(userId, {
      type: 'document_created',
      title: 'Document ajouté',
      message: `${title} a été ajouté avec succès`
    });

    return data;
  }

  async checkUserLimits(userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (profile.subscription_tier === 'free') {
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count >= 5) {
        throw new Error('Limite freemium atteinte');
      }
    }
  }
}

module.exports = new DocumentService();
```

### **3. Middleware de Sécurité Renforcé**

```javascript
// backend/src/middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting par endpoint
const createRateLimiter = (windowMs, max, message) => 
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });

module.exports = {
  // Protection générale
  general: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),

  // Rate limiting pour l'auth
  authLimiter: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 tentatives
    'Trop de tentatives de connexion'
  ),

  // Rate limiting pour l'upload
  uploadLimiter: createRateLimiter(
    60 * 1000, // 1 minute
    10, // 10 uploads
    'Trop d\'uploads simultanés'
  ),

  // Validation JWT avancée
  authenticateToken: async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
      }

      // Vérification Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(403).json({ error: 'Token invalide' });
      }

      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur authentification' });
    }
  }
};
```

## 🔗 **Services Frontend Optimisés**

### **Service API Axios Avancé**

```typescript
// frontend/src/services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log des requêtes en dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse avec gestion d'erreurs
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log des réponses en dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Gestion centralisée des erreurs
    if (error.response?.status === 401) {
      // Token expiré
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }

    if (error.response?.status === 429) {
      // Rate limit
      toast.error('Trop de requêtes, veuillez patienter');
    }

    if (error.response?.status >= 500) {
      // Erreur serveur
      toast.error('Erreur serveur, veuillez réessayer');
    }

    return Promise.reject(error);
  }
);

// Service Documents avec cache
class DocumentsService {
  private cache = new Map();
  
  async getDocuments(params?: any) {
    const cacheKey = JSON.stringify(params);
    
    // Vérifier le cache (5 minutes)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    const response = await api.get('/documents', { params });
    
    // Mettre en cache
    this.cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  }

  async uploadDocument(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    // Requête avec progression
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total!
        );
        // Émettre l'événement de progression
        window.dispatchEvent(
          new CustomEvent('upload-progress', { detail: percentCompleted })
        );
      },
    });

    // Invalider le cache
    this.cache.clear();
    
    return response.data;
  }
}

export const documentsService = new DocumentsService();
```

## 📊 **Monitoring & Logs**

### **Système de Logs**
```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'docvault-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## 🧪 **Tests & Validation**

### **Tests API (À Implémenter)**
```javascript
// backend/tests/documents.test.js
const request = require('supertest');
const app = require('../src/server');

describe('Documents API', () => {
  let authToken;
  
  beforeEach(async () => {
    // Obtenir un token de test
    const response = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = response.body.session.access_token;
  });

  test('GET /api/documents - should return user documents', async () => {
    const response = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/documents - should upload document', async () => {
    const response = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', 'tests/fixtures/test-document.pdf')
      .field('metadata', JSON.stringify({ title: 'Test Doc' }))
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Doc');
  });
});
```

## 📋 **Workflow Quotidien**

### **Matin : Backend Focus**
1. `git checkout feature/backend-api`
2. `npm run dev` (backend)
3. Tester les endpoints avec Postman/curl
4. Vérifier les logs et performances

### **Après-midi : Intégration**
1. `git checkout feature/integration`
2. Travailler sur les services frontend
3. Tester l'intégration complète
4. Résoudre les problèmes de communication

### **Communication avec l'Équipe**
- **Dev 1 (UI)** : Fournir les specs API pour les formulaires
- **Dev 2 (Dashboard)** : Fournir les endpoints de statistiques
- **Tests communs** : Coordonner les tests d'intégration

## 🏆 **Objectifs de Réussite**

**Fin Semaine 1 :**
- [ ] API Backend complète et sécurisée
- [ ] Services frontend optimisés
- [ ] Intégration parfaite Frontend/Backend
- [ ] Tests automatisés en place
- [ ] Documentation API complète

**Critères de Qualité :**
- ⭐ **Sécurité** : Authentification bulletproof
- ⭐ **Performance** : API rapide (<200ms)
- ⭐ **Fiabilité** : Gestion d'erreurs complète
- ⭐ **Évolutivité** : Code maintenable et scalable

---

## 🆘 **Support & Coordination**

**Votre rôle de Lead :**
- Débloquer les autres développeurs
- Maintenir la cohérence technique
- Valider les intégrations

**Bon développement technique ! ⚙️**