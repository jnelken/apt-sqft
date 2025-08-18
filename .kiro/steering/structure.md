# Project Structure & Architecture

## Folder Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components
│   ├── ColorSettings.tsx
│   ├── FloorPlanDetails.tsx
│   ├── FloorPlanName.tsx
│   ├── FloorPlanTabs.tsx
│   ├── FurnitureForm.tsx
│   ├── FurnitureList.tsx
│   ├── GridSettings.tsx
│   ├── ImageSettings.tsx
│   ├── LayoutEditor.tsx  # Main canvas component
│   ├── RoomDetails.tsx
│   ├── RoomForm.tsx
│   ├── RoomList.tsx
│   ├── ThemeSwitcher.tsx
│   └── ZoomControls.tsx
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
└── index.css            # Global styles
```

## Component Architecture

### Main Components

- **App.tsx**: Root component managing global state and layout
- **LayoutEditor.tsx**: Interactive canvas for drag-and-drop editing
- **Form Components**: RoomForm, FurnitureForm for adding/editing items
- **List Components**: RoomList, FurnitureList for item management
- **Settings Components**: GridSettings, ColorSettings, ImageSettings, etc.

### Component Guidelines

- Use functional components with hooks
- All components must be TypeScript typed with proper interfaces
- Define explicit interfaces for component props
- Use descriptive handler names (e.g., `handleRoomMove`)
- Leverage Material-UI components and theming system

## State Management

### Centralized State Pattern

- **`appState`**: Main application state (current floor plan, UI state, settings)
- **`floorPlans`**: Collection of all floor plans (persisted to localStorage)
- **`currentFloorPlanName`**: Active floor plan identifier

### Data Persistence

- **localStorage**: Floor plans and app settings
- **sessionStorage**: Undo/redo history (session-specific)

### History Management

- Implements undo/redo with keyboard shortcuts
- Uses `pushToHistory()` for undoable actions
- History stored in sessionStorage to prevent memory issues

## Core Data Models

### Key Interfaces

```typescript
interface Room {
  id: string;
  name: string;
  height: number;
  width: number;
  sqFootage: number;
  roomType: 'livable' | 'non-livable' | 'outdoor';
  points: Point[];
  x: number;
  y: number;
  isRelative: boolean;
  relativeTo?: string;
  relativeRatio?: number;
}

interface Furniture extends Room {
  type: string;
}

interface FloorPlan {
  name: string;
  rooms: Room[];
  furniture: Furniture[];
  backgroundImage: string | null;
  imageScale: number;
}
```

## Coding Conventions

### TypeScript Standards

- Avoid `any` types - use proper interfaces
- Export interfaces from `src/types/index.ts`
- Use strict TypeScript configuration

### React Patterns

- Functional components with hooks
- Use `React.memo` for expensive components
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations

### State Updates

- Always create new objects/arrays for state updates (immutability)
- Use `pushToHistory()` for actions that should be undoable
- Batch related state changes when possible

### Material-UI Integration

- Use MUI components consistently
- Leverage theming system for colors and spacing
- Use `styled` components for custom styling
- Follow MUI naming conventions
