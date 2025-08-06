# 🔐 Configuration de Sécurité DocVault

## Clés de Sécurité Générées

### Clés Actuelles
- **ENCRYPTION_KEY**: `upBxnQsqma/s8H2DO6EbrX8zT/CACiGyACr3i0CJDh8=`
- **NEXTAUTH_SECRET**: `twY4q8Zlqk9GqtU7la33Nnu0qObNlPepdgrlgdYSlzQ=`

## 🔒 Chiffrement des Documents

### Utilisation
```typescript
import { encryptFile, decryptFile } from '@/lib/utils/encryption'

// Chiffrer un fichier
const { encrypted, metadata } = encryptFile(fileBuffer)

// Déchiffrer un fichier
const decrypted = decryptFile(encryptedBuffer, metadata)
```

### Algorithme
- **Algorithme**: AES-256-GCM
- **IV**: Généré aléatoirement pour chaque fichier
- **Auth Tag**: Pour l'intégrité des données
- **AAD**: "docvault" pour l'authentification

## 🛡️ Gestion des Sessions

### Utilisation
```typescript
import { requireAuth, getCurrentUser, signOut } from '@/lib/utils/session'

// Vérifier l'authentification (avec redirection)
const user = await requireAuth()

// Récupérer l'utilisateur actuel
const user = await getCurrentUser()

// Déconnexion
await signOut()
```

## ⚠️ Sécurité

### Variables d'Environnement
- ✅ `.env.local` est dans `.gitignore`
- ✅ Clés générées de manière sécurisée
- ✅ Chaque environnement a ses propres clés

### Bonnes Pratiques
1. **Ne jamais committer** les clés dans Git
2. **Utiliser des clés différentes** pour dev/staging/prod
3. **Régénérer les clés** si compromission suspectée
4. **Sauvegarder les clés** de manière sécurisée

## 🔄 Régénération des Clés

### Si compromission suspectée :
```bash
# Générer de nouvelles clés
node -e "console.log('ENCRYPTION_KEY:', require('crypto').randomBytes(32).toString('base64')); console.log('NEXTAUTH_SECRET:', require('crypto').randomBytes(32).toString('base64'));"
```

### Mise à jour
1. Générer de nouvelles clés
2. Mettre à jour `.env.local`
3. Redémarrer l'application
4. Réchiffrer tous les documents existants (si nécessaire)

## 📋 Checklist de Sécurité

- [x] Clés de chiffrement générées
- [x] Secret NextAuth configuré
- [x] Variables d'environnement sécurisées
- [x] Utilitaires de chiffrement créés
- [x] Gestion des sessions implémentée
- [x] Documentation de sécurité créée

## 🚀 Prochaines Étapes

1. **Implémenter l'upload de fichiers** avec chiffrement
2. **Ajouter la gestion des métadonnées** de chiffrement
3. **Créer des tests de sécurité**
4. **Configurer le monitoring** des accès
5. **Implémenter l'audit trail** des actions 