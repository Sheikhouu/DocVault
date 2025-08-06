# 📊 Guide Développeur 2 - Dashboard & Gestion Documents

## 👤 **Votre Mission**
Vous êtes responsable de **l'interface utilisateur principale** et de la **gestion des documents**. Vous créez le cœur fonctionnel de l'application DocVault.

## 🌳 **Vos Branches Git**
```bash
# Créer et basculer sur vos branches
git checkout -b feature/dashboard
git checkout -b feature/documents

# Pour changer de branche
git checkout feature/dashboard
git checkout feature/documents
```

## 📁 **Vos Zones de Travail**

### **1. Interface Dashboard**
```
frontend/src/components/dashboard/
├── quick-actions.tsx      🎯 Actions rapides
├── reminders-widget.tsx   🎯 Widget rappels
└── stats-overview.tsx     🎯 Statistiques

frontend/src/app/dashboard/
├── layout.tsx            🎯 Layout principal
├── page.tsx              🎯 Page d'accueil dashboard
└── reminders/page.tsx    🎯 Page rappels
```

### **2. Layout & Navigation**
```
frontend/src/components/layout/
├── dashboard-header.tsx   🎯 Header avec navigation
├── mobile-sidebar.tsx    🎯 Menu mobile
├── notification-center.tsx 🎯 Centre de notifications
└── sidebar.tsx           🎯 Navigation principale
```

### **3. Gestion Documents**
```
frontend/src/components/document/
├── document-filters.tsx    🎯 Filtres et recherche
├── document-list.tsx      🎯 Liste des documents
├── document-preview.tsx   🎯 Prévisualisation
├── document-reminders.tsx 🎯 Gestion rappels
├── document-share.tsx     🎯 Partage sécurisé
└── document-upload.tsx    🎯 Upload de fichiers
```

### **4. Pages Documents**
```
frontend/src/app/documents/
└── page.tsx              🎯 Page principale documents

frontend/src/app/settings/
└── page.tsx              🎯 Paramètres utilisateur
```

## 🎯 **Tâches Prioritaires - Semaine 1**

### **Jour 1-2 : Dashboard Layout**
- [ ] **Créer le layout principal responsive**
  - Sidebar collapsible sur mobile
  - Header avec navigation et profil utilisateur
  - Zone de contenu adaptable

- [ ] **Implémenter la navigation**
  - Menu principal (Dashboard, Documents, Paramètres)
  - Breadcrumbs pour la navigation
  - États actifs et hover

### **Jour 3-4 : Widgets Dashboard**
- [ ] **Statistiques utilisateur**
  - Nombre de documents
  - Stockage utilisé
  - Documents expirant bientôt

- [ ] **Actions rapides**
  - Upload rapide de documents
  - Recherche globale
  - Accès aux fonctions importantes

### **Jour 5-7 : Gestion Documents**
- [ ] **Interface de gestion complète**
  - Liste avec tri et filtrage
  - Prévisualisation des fichiers
  - Actions (partage, suppression, modification)

## 📊 **Composants Dashboard**

### **1. Stats Overview Component**
```tsx
// frontend/src/components/dashboard/stats-overview.tsx
interface StatsProps {
  documentsCount: number;
  storageUsed: number;
  expiringCount: number;
}

const StatsOverview = ({ documentsCount, storageUsed, expiringCount }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Documents" 
        value={documentsCount}
        icon={<FileIcon />}
        trend="+2 ce mois"
      />
      <StatCard 
        title="Stockage" 
        value={formatBytes(storageUsed)}
        icon={<CloudIcon />}
        trend="75% utilisé"
      />
      <StatCard 
        title="À renouveler" 
        value={expiringCount}
        icon={<AlertIcon />}
        urgent={expiringCount > 0}
      />
    </div>
  );
};
```

### **2. Document List Component**
```tsx
// frontend/src/components/document/document-list.tsx
interface Document {
  id: string;
  title: string;
  category: string;
  fileSize: number;
  createdAt: string;
  expiryDate?: string;
}

const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filters, setFilters] = useState({ category: '', search: '' });

  return (
    <div className="space-y-4">
      <DocumentFilters filters={filters} onFiltersChange={setFilters} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
};
```

### **3. Upload Component**
```tsx
// frontend/src/components/document/document-upload.tsx
const DocumentUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('metadata', JSON.stringify({
      title: files[0].name,
      category: 'general'
    }));

    // Upload via API service
    await documentsAPI.createDocument(formData);
  };

  return (
    <div 
      className={`
        border-2 border-dashed rounded-lg p-8 text-center
        ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileDrop}
    >
      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p>Glissez vos documents ici ou cliquez pour sélectionner</p>
    </div>
  );
};
```

## 🏗 **Architecture Layout**

### **Dashboard Layout Structure**
```tsx
// frontend/src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <DashboardHeader />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </div>
  );
}
```

### **Sidebar Navigation**
```tsx
// frontend/src/components/layout/sidebar.tsx
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Documents', href: '/documents', icon: DocumentIcon },
  { name: 'Rappels', href: '/dashboard/reminders', icon: BellIcon },
  { name: 'Paramètres', href: '/settings', icon: CogIcon },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-2 px-4 py-6">
      {navigationItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`
            group flex items-center px-3 py-2 rounded-md text-sm font-medium
            ${pathname === item.href 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-accent'
            }
          `}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
};
```

## 📱 **Responsive Design**

### **Mobile-First Approach**
```tsx
// Exemple de composant responsive
<div className="
  grid grid-cols-1        // Mobile: 1 colonne
  md:grid-cols-2         // Tablet: 2 colonnes
  lg:grid-cols-3         // Desktop: 3 colonnes
  gap-4 md:gap-6         // Espacement adaptatif
">
  {/* Contenu adaptatif */}
</div>
```

### **Sidebar Responsive**
```tsx
// Logique de sidebar mobile/desktop
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Desktop: toujours visible
// Mobile: overlay avec backdrop
```

## 🔗 **Intégration API**

### **Services à Utiliser**
```tsx
import { documentsAPI, profileAPI } from '@/services/api';

// Récupérer les documents
const documents = await documentsAPI.getDocuments({ 
  category: 'identity',
  search: 'passeport' 
});

// Statistiques utilisateur
const stats = await profileAPI.getStats();
```

### **Gestion d'État Local**
```tsx
// Utiliser React hooks pour l'état
const [documents, setDocuments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Charger les données
useEffect(() => {
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadDocuments();
}, []);
```

## 🎨 **Guidelines UX**

### **Navigation**
- **Claire et intuitive** : Utilisateur trouve facilement ses documents
- **États visuels** : Active, hover, disabled bien différenciés  
- **Breadcrumbs** : Navigation contextuelle

### **Gestion Documents**
- **Aperçu rapide** : Prévisualisation sans ouvrir
- **Actions contextuelles** : Menu au clic droit
- **Feedback visuel** : Chargement, succès, erreurs

### **Performance**
- **Lazy loading** : Charger les documents à la demande
- **Pagination** : Limiter les résultats affichés
- **Recherche en temps réel** : Avec debounce

## 🧪 **Tests Utilisateur**

### **Scénarios à Tester**
1. **Navigation fluide** : Passer d'une section à l'autre
2. **Upload document** : Glisser-déposer et sélection
3. **Recherche efficace** : Trouver un document rapidement
4. **Actions rapides** : Partager, supprimer, modifier

### **Checklist Fonctionnelle**
- [ ] **Navigation** : Tous les liens fonctionnent
- [ ] **Responsive** : Interface fluide sur mobile/desktop
- [ ] **Performance** : Chargement rapide des listes
- [ ] **Accessibilité** : Navigation clavier

## 📋 **Workflow Quotidien**

### **Début de Journée**
1. `git pull origin main`
2. `git checkout feature/dashboard` ou `feature/documents`
3. `npm run dev`

### **Pendant le Développement**
- **API Backend** : Utiliser les endpoints du Développeur 3
- **Design** : Suivre le design system du Développeur 1
- **Tests** : Vérifier sur mobile et desktop

### **Fin de Journée**
1. `git add .`
2. `git commit -m "feat(dashboard): description"`
3. `git push origin feature/dashboard`

## 🏆 **Objectifs de Réussite**

**Fin Semaine 1 :**
- [ ] Dashboard fonctionnel avec navigation complète
- [ ] Interface de gestion des documents opérationnelle
- [ ] Upload et prévisualisation de fichiers
- [ ] Responsive design parfait mobile/desktop

**Critères de Qualité :**
- ⭐ **Fonctionnalité** : Toutes les actions marchent
- ⭐ **Performance** : Interface réactive
- ⭐ **UX** : Navigation intuitive
- ⭐ **Responsive** : Parfait sur tous supports

---

## 🆘 **Aide & Support**

**API Backend :** Développeur 3
**Design System :** Développeur 1  
**Coordination :** Daily meetings

**Bon développement ! 📊**