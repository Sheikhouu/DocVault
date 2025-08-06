# 🌳 Workflow Git - Équipe DocVault

## 🎯 **Stratégie de Branches**

### **Structure des Branches**
```
main (🔒 protégée)
├── feature/ui-design        (Dev 1 - UI/UX)
├── feature/design-system    (Dev 1 - Composants)
├── feature/dashboard        (Dev 2 - Interface principale)
├── feature/documents        (Dev 2 - Gestion docs)
├── feature/backend-api      (Dev 3 - API Backend)
└── feature/integration      (Dev 3 - Services frontend)
```

## 📋 **Règles de Travail**

### **🚫 Interdictions Strictes**
- **JAMAIS** push directement sur `main`
- **JAMAIS** merge sans Pull Request
- **JAMAIS** travailler sur la branche d'un autre développeur

### **✅ Bonnes Pratiques**
- **Toujours** partir de `main` à jour pour créer une nouvelle branche
- **Toujours** faire des commits fréquents avec des messages clairs
- **Toujours** tester avant de push

## 🔄 **Workflow Quotidien**

### **🌅 Début de Journée**
```bash
# 1. Se positionner sur main
git checkout main

# 2. Récupérer les dernières modifications
git pull origin main

# 3. Basculer sur votre branche de travail
git checkout feature/votre-branche

# 4. Récupérer les nouveautés de main (si nécessaire)
git merge main
```

### **💻 Pendant le Développement**
```bash
# Commits fréquents (toutes les 30-60 minutes)
git add .
git commit -m "feat(ui): amélioration du composant Button"

# Push régulier (fin de tâche importante)
git push origin feature/votre-branche
```

### **🌙 Fin de Journée**
```bash
# Sauvegarder tout votre travail
git add .
git commit -m "wip: travail en cours sur le dashboard"
git push origin feature/votre-branche
```

## 📝 **Convention de Commits**

### **Format Standard**
```
type(scope): description courte

Corps du message (optionnel)
```

### **Types de Commits**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `style`: Changements de style/CSS
- `refactor`: Refactoring du code
- `test`: Ajout de tests
- `docs`: Documentation
- `chore`: Tâches de maintenance
- `wip`: Work in Progress (travail en cours)

### **Exemples par Développeur**

**Développeur 1 (UI/UX) :**
```bash
git commit -m "feat(ui): nouveau design system avec variables CSS"
git commit -m "style(auth): amélioration formulaire de connexion"
git commit -m "feat(landing): création de la page d'accueil"
```

**Développeur 2 (Dashboard) :**
```bash
git commit -m "feat(dashboard): ajout du widget statistiques"
git commit -m "feat(documents): interface de gestion des fichiers"
git commit -m "fix(navigation): correction du menu mobile"
```

**Développeur 3 (Backend) :**
```bash
git commit -m "feat(api): endpoint de création de documents"
git commit -m "fix(auth): correction du middleware d'authentification"
git commit -m "feat(integration): service API frontend avec cache"
```

## 🔀 **Pull Requests & Reviews**

### **Créer une Pull Request**
1. **Finaliser votre branche**
```bash
git checkout feature/votre-branche
git add .
git commit -m "feat: finalisation de la fonctionnalité X"
git push origin feature/votre-branche
```

2. **Sur GitHub**
   - Aller sur le repository DocVault
   - Cliquer "New Pull Request"
   - Base: `main` ← Compare: `feature/votre-branche`
   - Titre clair et description détaillée

### **Template de Pull Request**
```markdown
## 🎯 Objectif
Description de ce que fait cette PR

## 🔄 Changements
- [ ] Fonctionnalité A ajoutée
- [ ] Bug B corrigé
- [ ] Component C amélioré

## 🧪 Tests
- [ ] Tests manuels effectués
- [ ] Compatible mobile/desktop
- [ ] Intégration API testée

## 📸 Screenshots
(Si changements visuels)

## 📋 Checklist
- [ ] Code testé localement
- [ ] Pas de console.log oubliés
- [ ] Documentation mise à jour
```

### **Process de Review**
1. **Auto-review** : Relisez votre propre code
2. **Assignation** : Demander review aux autres devs
3. **Corrections** : Appliquer les retours
4. **Merge** : Seulement après validation

## 🚀 **Déploiement**

### **Branches Spéciales**
```
main         → Production (automatique)
develop      → Staging (si nécessaire)
hotfix/*     → Corrections urgentes
```

### **Release Process**
1. Toutes les features mergées dans `main`
2. Tests d'intégration complets
3. Tag de version : `git tag v1.0.0`
4. Déploiement automatique

## 🔧 **Commandes Git Utiles**

### **Navigation**
```bash
# Voir toutes les branches
git branch -a

# Changer de branche
git checkout nom-branche

# Créer et basculer sur nouvelle branche
git checkout -b nouvelle-branche

# Supprimer une branche locale
git branch -d ancienne-branche
```

### **Résolution de Conflits**
```bash
# Si conflit lors du merge
git status                    # Voir les fichiers en conflit
# Résoudre manuellement dans l'éditeur
git add .                     # Marquer comme résolu
git commit                    # Finaliser le merge
```

### **Historique et Status**
```bash
# Voir l'historique
git log --oneline -10

# Voir les modifications non commitées
git diff

# Voir le statut de la branche
git status
```

## 🆘 **Résolution de Problèmes**

### **J'ai committé sur main par erreur**
```bash
# Annuler le dernier commit (garde les modifications)
git reset HEAD~1

# Créer la bonne branche
git checkout -b feature/ma-branche

# Re-committer
git add .
git commit -m "fix: déplacement du commit sur la bonne branche"
```

### **Ma branche est en retard sur main**
```bash
# Se positionner sur main
git checkout main
git pull origin main

# Retourner sur votre branche et merger
git checkout feature/ma-branche
git merge main

# Résoudre les conflits si nécessaire
```

### **J'ai des modifications non sauvées**
```bash
# Sauvegarder temporairement
git stash

# Faire les opérations nécessaires
git checkout main
git pull origin main

# Récupérer vos modifications
git checkout feature/ma-branche
git stash pop
```

## 📊 **Monitoring des Branches**

### **Commandes de Suivi**
```bash
# Voir l'état de toutes les branches
git branch -vv

# Voir les commits en avance/retard
git log main..feature/ma-branche --oneline

# Statistiques des contributions
git shortlog -sn
```

## 🏆 **Objectifs de Qualité**

### **Métriques à Respecter**
- **Commits** : Au moins 3-5 par jour
- **Pull Requests** : Maximum 500 lignes de code
- **Review Time** : Moins de 24h pour reviewer une PR
- **Conflicts** : Résolution rapide (<1h)

### **Bonnes Pratiques d'Équipe**
- **Communication** : Prévenir avant les gros changements
- **Coordination** : Daily sync sur les branches
- **Documentation** : Maintenir le README à jour

---

## 📚 **Ressources**

- **Git Cheatsheet** : https://training.github.com/downloads/github-git-cheat-sheet/
- **Conventional Commits** : https://www.conventionalcommits.org/
- **GitHub Flow** : https://guides.github.com/introduction/flow/

**Happy Coding! 🚀**