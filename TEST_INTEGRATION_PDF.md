# Guide de Test - Intégration Conversion PDF

## 🎯 Objectif
Tester l'intégration complète de la conversion PDF entre DocVault, n8n et Supabase.

## 📋 Prérequis pour les Tests

### 1. Services en marche
- ✅ **Backend DocVault** : http://localhost:8000
- ✅ **Frontend DocVault** : http://localhost:3000  
- ✅ **n8n** : http://localhost:5678
- ✅ **Supabase** : Base de données configurée

### 2. Configuration
- Variables d'environnement configurées
- Migration SQL exécutée dans Supabase
- Workflow n8n créé et activé

### 3. Données de test
- Fichiers de test : `.docx`, `.xlsx`, `.pptx`, `.jpg`, `.png`, `.txt`

## 🧪 Plan de Tests

### Phase 1: Tests Backend API

#### Test 1.1: Endpoint de santé
```bash
curl http://localhost:8000/api/health
```
**Résultat attendu :** `{"status":"OK","message":"DocVault Backend API is running"}`

#### Test 1.2: Webhook trigger
```bash
curl -X POST http://localhost:8000/api/webhooks/trigger-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-123",
    "fileUrl": "https://example.com/test.docx",
    "fileName": "test.docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "userId": "user-123"
  }'
```

#### Test 1.3: Statut de conversion
```bash
curl http://localhost:8000/api/webhooks/conversion-status/test-123
```

### Phase 2: Tests n8n

#### Test 2.1: Webhook n8n accessible
```bash
curl -X POST http://localhost:5678/webhook/document-conversion \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-123",
    "fileUrl": "https://example.com/test.docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }'
```

#### Test 2.2: Conversion LibreOffice
```bash
# Dans le container n8n
docker exec docvault-n8n libreoffice --headless --convert-to pdf --outdir /tmp /tmp/test.docx
```

### Phase 3: Tests Frontend

#### Test 3.1: Upload document
1. Aller sur http://localhost:3000/dashboard
2. Cliquer "Ajouter Document" 
3. Sélectionner un fichier `.docx`
4. Remplir métadonnées et uploader
5. Vérifier que le statut initial est "En attente"

#### Test 3.2: Suivi conversion
1. Attendre quelques secondes
2. Actualiser la liste des documents
3. Vérifier progression : En attente → Conversion... → Terminé
4. Cliquer "Télécharger PDF" si disponible

#### Test 3.3: Statistiques
1. Vérifier widget "Conversion PDF" sur dashboard
2. Vérifier compteurs (total, terminé, échecs)
3. Vérifier taux de succès

### Phase 4: Tests d'Erreur

#### Test 4.1: Fichier non supporté
1. Uploader fichier `.xyz` (extension non supportée)
2. Vérifier statut "Échec" 
3. Cliquer "Réessayer" et vérifier comportement

#### Test 4.2: n8n indisponible
1. Arrêter n8n : `docker stop docvault-n8n`
2. Uploader un document
3. Vérifier gestion d'erreur backend
4. Redémarrer n8n et tester retry

#### Test 4.3: Fichier corrompu
1. Uploader fichier corrompu 
2. Vérifier échec de conversion
3. Vérifier message d'erreur approprié

## 📊 Checklist de Validation

### ✅ Backend
- [ ] Routes webhook fonctionnelles
- [ ] Trigger n8n après upload 
- [ ] Mise à jour statut en base
- [ ] Gestion erreurs appropriée
- [ ] Logs informatifs

### ✅ n8n  
- [ ] Webhook accessible
- [ ] Téléchargement fichier depuis Supabase
- [ ] Conversion PDF réussie
- [ ] Upload PDF vers Supabase
- [ ] Callback statut vers backend

### ✅ Frontend
- [ ] Affichage statut conversion
- [ ] Bouton téléchargement PDF
- [ ] Widget statistiques
- [ ] Bouton "Réessayer"
- [ ] Temps de réponse acceptable (<5s)

### ✅ Base de données
- [ ] Colonnes conversion ajoutées
- [ ] Statuts mis à jour correctement
- [ ] URLs PDF stockées
- [ ] Erreurs loggées

## 🐛 Scénarios d'Erreur à Tester

1. **n8n indisponible** → Statut "failed" + possibilité retry
2. **Fichier trop volumineux** → Erreur explicite 
3. **Format non supporté** → Conversion failed + message clair
4. **Supabase storage plein** → Erreur gracieuse
5. **Timeout conversion** → Retry automatique ou manuel

## 📈 Métriques de Performance

- **Temps upload** : < 10s pour fichier 10MB
- **Temps conversion** : < 30s pour document simple
- **Temps total** : < 45s de l'upload au PDF disponible
- **Taux succès** : > 95% pour formats supportés

## 🔧 Commandes Utiles de Debug

### Logs Backend
```bash
cd backend && npm run dev
# Surveiller logs console
```

### Logs n8n
```bash
docker logs docvault-n8n -f
```

### Logs Supabase (local)
```bash
# Via interface Supabase Studio
# Onglet "Logs" → "API" et "Database"
```

### Test de conversion manuelle
```bash
# Dans n8n container
docker exec -it docvault-n8n bash
libreoffice --headless --convert-to pdf --outdir /tmp /path/to/document.docx
```

## 📝 Rapport de Test

Créer un fichier `test-report.md` avec :

### Résultats
- [ ] **Upload** : ✅ / ❌
- [ ] **Trigger n8n** : ✅ / ❌  
- [ ] **Conversion PDF** : ✅ / ❌
- [ ] **Download PDF** : ✅ / ❌
- [ ] **Statistiques** : ✅ / ❌

### Temps de Response
- Upload → Pending : ___ ms
- Pending → Converting : ___ s  
- Converting → Completed : ___ s
- Total : ___ s

### Problèmes Identifiés
1. **Problème 1** : Description + Solution
2. **Problème 2** : Description + Solution

### Formats Testés
- [ ] .docx → PDF : ✅ / ❌
- [ ] .xlsx → PDF : ✅ / ❌ 
- [ ] .pptx → PDF : ✅ / ❌
- [ ] .jpg → PDF : ✅ / ❌
- [ ] .png → PDF : ✅ / ❌
- [ ] .txt → PDF : ✅ / ❌

## 🚀 Mise en Production

### Avant déploiement
- [ ] Tous les tests passent
- [ ] Performance acceptable 
- [ ] Gestion erreurs robuste
- [ ] Monitoring en place
- [ ] Documentation à jour

### Configuration production
- [ ] Variables environnement sécurisées
- [ ] n8n derrière proxy/HTTPS
- [ ] Limits de débit configurées  
- [ ] Backup et recovery plan
- [ ] Alertes monitoring

---

**🎉 Succès :** L'intégration est fonctionnelle quand un utilisateur peut :
1. Uploader un document
2. Voir le statut conversion en temps réel  
3. Télécharger le PDF converti
4. Relancer conversion en cas d'échec