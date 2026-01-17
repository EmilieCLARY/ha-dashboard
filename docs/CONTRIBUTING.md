# Guide de Contribution

Merci de votre intérêt pour contribuer au **HA Dashboard** ! 🎉

---

## 📋 Table des Matières

1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Structure du Projet](#structure-du-projet)
4. [Standards de Code](#standards-de-code)
5. [Tests](#tests)
6. [Git Workflow](#git-workflow)
7. [Pull Requests](#pull-requests)

---

## 🤝 Code de Conduite

Ce projet adhère à un code de conduite. En participant, vous vous engagez à respecter les autres contributeurs et à maintenir un environnement accueillant.

---

## 💡 Comment Contribuer

### Signaler un Bug

1. Vérifier que le bug n'a pas déjà été signalé dans les [Issues](../../issues)
2. Ouvrir une nouvelle issue avec:
   - Titre clair et descriptif
   - Description détaillée du problème
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots si applicable
   - Environment (OS, Browser, versions)

### Proposer une Feature

1. Ouvrir une [Discussion](../../discussions) pour en discuter
2. Si approuvé, créer une Issue détaillée
3. Attendre validation avant de commencer le développement

### Contribuer du Code

1. Fork le repository
2. Créer une branche depuis `main`
3. Faire vos changements
4. Écrire des tests
5. Vérifier que tous les tests passent
6. Soumettre une Pull Request

---

## 📁 Structure du Projet

```
ha-dashboard/
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services (API, WebSocket)
│   │   ├── stores/       # État global (Zustand)
│   │   ├── tests/        # Tests Vitest
│   │   └── ...
│   └── package.json
├── backend/               # API Node.js/Express
│   ├── src/
│   │   ├── routes/       # Routes Express
│   │   ├── services/     # Logique métier
│   │   ├── middleware/   # Middlewares Express
│   │   ├── __tests__/    # Tests Jest
│   │   └── ...
│   └── package.json
├── docs/                  # Documentation
├── docker-compose.yml     # Configuration Docker
└── README.md
```

---

## 🎨 Standards de Code

### TypeScript

- **Toujours typer** vos variables, fonctions et composants
- Éviter `any`, préférer `unknown` si nécessaire
- Utiliser les interfaces pour les objets complexes

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Mauvais
function getUser(id: any): any {
  // ...
}
```

### React

- **Functional Components** uniquement
- **Hooks** pour la logique
- **Props** typées avec interface

```typescript
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button className={variant} onClick={onClick}>{label}</button>;
}

// ❌ Mauvais
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Nommage

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase avec préfixe `use` (`useAuth.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`HomeAssistantEntity`)

### Imports

- Grouper et ordonner les imports:
  1. Librairies externes
  2. Imports internes (services, stores)
  3. Composants
  4. Types
  5. Styles

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal imports
import { apiService } from '../services/api.service';
import { useEntitiesStore } from '../stores/entities.store';

// 3. Components
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// 4. Types
import type { HomeAssistantEntity } from '../services/api.service';

// 5. Styles (si applicable)
import './styles.css';
```

### Commentaires

- Commenter **pourquoi**, pas **quoi**
- Utiliser JSDoc pour les fonctions publiques

```typescript
// ✅ Bon
/**
 * Calcule le prix avec taxes
 * Utilise le taux de TVA français (20%)
 */
function calculatePriceWithTax(price: number): number {
  return price * 1.20; // TVA française
}

// ❌ Mauvais
// Multiplie le prix par 1.20
function calculatePriceWithTax(price: number): number {
  return price * 1.20;
}
```

---

## 🧪 Tests

### Frontend (Vitest)

```bash
cd frontend
npm test                  # Mode watch
npm run test:coverage     # Avec couverture
```

**Conventions**:
- Un fichier de test par composant/service
- Nommage: `ComponentName.test.tsx`
- Tester le comportement, pas l'implémentation

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Backend (Jest)

```bash
cd backend
npm test                  # Une fois
npm run test:watch        # Mode watch
npm run test:coverage     # Avec couverture
```

**Conventions**:
- Tests dans `src/__tests__/`
- Nommage: `service.test.ts`
- Utiliser Supertest pour les tests d'API

```typescript
import request from 'supertest';
import app from '../app';

describe('GET /api/entities', () => {
  it('should return entities list', async () => {
    const response = await request(app)
      .get('/api/entities')
      .expect(200);

    expect(response.body).toHaveProperty('entities');
    expect(Array.isArray(response.body.entities)).toBe(true);
  });
});
```

### Couverture Minimale

- **Frontend**: 75% global, 80% components
- **Backend**: 80% global, 90% services

---

## 🌿 Git Workflow

### Branches

```bash
main          # Production-ready code
develop       # Integration branch (optionnel)
feature/*     # Nouvelles fonctionnalités
bugfix/*      # Corrections de bugs
hotfix/*      # Corrections urgentes en production
```

### Commits

**Format**: `type(scope): message`

**Types**:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, pas de changement de code
- `refactor`: Refactoring du code
- `test`: Ajout ou modification de tests
- `chore`: Tâches de maintenance

**Exemples**:
```bash
feat(widgets): add energy consumption widget
fix(auth): resolve token refresh issue
docs(api): update entity endpoints documentation
test(frontend): add Button component tests
```

### Pull Requests

1. **Créer une branche**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Faire vos changements et commits**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push vers votre fork**
   ```bash
   git push origin feature/my-feature
   ```

4. **Ouvrir une PR** sur GitHub

---

## 📝 Pull Requests

### Checklist

Avant de soumettre une PR, vérifier:

- [ ] Le code compile sans erreurs
- [ ] Tous les tests passent
- [ ] Nouveaux tests ajoutés si applicable
- [ ] Documentation mise à jour si nécessaire
- [ ] Pas de code commenté inutile
- [ ] Pas de `console.log` oubliés
- [ ] ESLint ne signale aucune erreur
- [ ] Prettier a formaté le code

### Template de PR

```markdown
## Description
<!-- Décrire les changements apportés -->

## Type de changement
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Tests
<!-- Décrire les tests ajoutés/modifiés -->

## Screenshots
<!-- Si applicable -->

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une review de mon propre code
- [ ] J'ai commenté les parties complexes
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de warnings
- [ ] J'ai ajouté des tests
- [ ] Tous les tests passent localement
```

---

## 🚀 Développement Local

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- Home Assistant instance (local ou remote)

### Installation

```bash
# Cloner le repo
git clone https://github.com/EmilieCLARY/ha-dashboard.git
cd ha-dashboard

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos valeurs

# Lancer avec Docker
docker-compose up -d

# Ou développement sans Docker
cd frontend && npm install && npm run dev
cd backend && npm install && npm run dev
```

### URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prisma Studio: `npm run prisma:studio` (backend)

---

## 📚 Ressources

- [Architecture](./ARCHITECTURE.md)
- [Quick Start](./QUICKSTART.md)
- [Testing Frontend](./TESTING_FRONTEND.md)
- [Testing Backend](./TESTING_BACKEND.md)
- [Deployment](./DEPLOYMENT.md)

---

## ❓ Questions

Si vous avez des questions, n'hésitez pas à:
- Ouvrir une [Discussion](../../discussions)
- Rejoindre notre [Discord](#) (à venir)
- Envoyer un email à [maintainer@example.com]

---

**Merci de contribuer au projet HA Dashboard ! 🙏**

---

**Dernière mise à jour** : 17 janvier 2026
