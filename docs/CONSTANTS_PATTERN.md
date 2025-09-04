# Constants Organization Pattern

This document outlines the recommended pattern for organizing constants in the Apt SqFt codebase, as demonstrated in the furniture constants file.

## Pattern Overview

The pattern follows a three-tier approach:

1. **Individual constants** - Each item defined as its own export
2. **Map creation** - Key-value map built from individual constants
3. **Array creation** - Array derived from map values

## Structure

### 1. Individual Constants

Define each constant as its own export at the top of the file:

```typescript
export const SOFA: FurnitureTemplate = {
  id: 'sofa',
  name: 'Sofa',
  type: 'Sofa',
  defaultWidth: 84,
  defaultHeight: 36,
  defaultColor: '#8B4513',
  category: 'seating',
};

export const CHAIR: FurnitureTemplate = {
  id: 'chair',
  name: 'Chair',
  type: 'Chair',
  defaultWidth: 24,
  defaultHeight: 24,
  defaultColor: '#A0522D',
  category: 'seating',
};
```

### 2. Map Creation

Create a key-value map using computed property names:

```typescript
export const FURNITURE_TEMPLATES_MAP: Record<string, FurnitureTemplate> = {
  [SOFA.id]: SOFA,
  [CHAIR.id]: CHAIR,
  // ... other items
};
```

### 3. Array Creation

Derive the array from the map values:

```typescript
export const FURNITURE_TEMPLATES: FurnitureTemplate[] = Object.values(
  FURNITURE_TEMPLATES_MAP,
);
```

## Benefits

- **Type Safety**: Each constant is individually typed
- **Easy Imports**: Import specific items: `import { SOFA, CHAIR } from './constants'`
- **Maintainable**: Simple to add/remove individual items
- **Consistent**: Map and array automatically stay in sync
- **Performance**: Direct access via map keys
- **Flexibility**: Work with individual constants, map, or array as needed

## Usage Examples

```typescript
// Import individual constants
import { SOFA, CHAIR } from './furniture.constants';

// Import the map for key-based lookups
import { FURNITURE_TEMPLATES_MAP } from './furniture.constants';
const sofaTemplate = FURNITURE_TEMPLATES_MAP['sofa'];

// Import the array for iteration
import { FURNITURE_TEMPLATES } from './furniture.constants';
FURNITURE_TEMPLATES.forEach(template => console.log(template.name));
```

## When to Use This Pattern

- **Configuration objects** that need multiple access patterns
- **Constants that benefit from both key-based and array-based access**

## Naming Conventions

- **Individual constants**: UPPER_SNAKE_CASE (e.g., `SOFA`, `DINING_TABLE`)
- **Map**: `{COLLECTION_NAME}_MAP` (e.g., `FURNITURE_TEMPLATES_MAP`)
- **Array**: `{COLLECTION_NAME}` (e.g., `FURNITURE_TEMPLATES`)

## Maintenance

When adding new items:

1. Add the individual constant at the top
2. Add the entry to the map
3. The array automatically updates

When removing items:

1. Remove the individual constant
2. Remove the entry from the map
3. The array automatically updates

This pattern ensures consistency and reduces the chance of synchronization errors between different representations of the same data.
