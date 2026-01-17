# 🧪 Guide de Tests

## Vue d'ensemble

Le projet utilise des frameworks de test modernes pour garantir la qualité du code:
- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest + Supertest

## Frontend Testing

### Configuration

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

### Structure des tests

```
frontend/src/tests/
├── components/     # Tests des composants UI
├── pages/         # Tests des pages
├── widgets/       # Tests des widgets
├── stores/        # Tests des stores Zustand
├── services/      # Tests des services
├── setup.ts       # Configuration globale
└── testUtils.ts   # Utilitaires de test
```

### Exécuter les tests

```bash
cd frontend
npm test              # Mode watch
npm run test:ui       # Interface visuelle
npm run test:coverage # Rapport de couverture
```

### Résultats actuels

- **Total**: 70+ tests
- **Taux de réussite**: 80%+
- **Couverture**: Composants, pages, widgets, stores

## Backend Testing

### Configuration

```json
{
  "test": "NODE_OPTIONS=--experimental-vm-modules jest",
  "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
  "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage"
}
```

### Structure des tests

```
backend/src/__tests__/
├── routes/        # Tests des routes API
├── setup.ts       # Configuration globale
└── health.test.ts # Tests de santé
```

### Exécuter les tests

```bash
cd backend
npm test              # Lancer tous les tests
npm run test:watch    # Mode watch
npm run test:coverage # Rapport de couverture
```

## Bonnes Pratiques

### Frontend
- Utiliser `createTestEntity()` pour créer des entités de test
- Mocker les hooks de navigation avec `vi.mock('react-router-dom')`
- Tester l'affichage, les interactions et la navigation
- Vérifier les couleurs, icônes et états conditionnels

### Backend
- Mocker les variables d'environnement dans `setup.ts`
- Utiliser `supertest` pour tester les routes HTTP
- Tester les codes de statut, la structure des réponses
- Isoler les tests avec `beforeEach` et `afterEach`

## CI/CD

Les tests sont automatiquement exécutés dans le pipeline GitHub Actions:
- Sur chaque push vers `main` ou `develop`
- Sur chaque pull request
- Échec du build si les tests échouent

## Dépannage

### Erreurs courantes

**Module not found**:
```bash
npm install  # Réinstaller les dépendances
```

**Mock errors**:
```typescript
// Utiliser vi.mock avant les imports
vi.mock('module-name');
```

**TypeScript errors**:
```bash
npm run build  # Vérifier la compilation
```

## Prochaines étapes

- [ ] Augmenter la couverture à 90%+
- [ ] Ajouter tests E2E avec Playwright
- [ ] Tests de performance
- [ ] Tests d'accessibilité
