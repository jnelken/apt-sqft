# Project Specification

## Architecture Overview

This is a React-based floor plan editor application built with TypeScript and Material-UI. The app follows a component-based architecture with centralized state management and local persistence.

## Technology Stack

### Core Technologies

- **React 19**: Latest React with concurrent features
- **TypeScript 4.9**: Static typing and enhanced developer experience
- **Material-UI v7**: Component library and theming system
- **Emotion**: CSS-in-JS styling (MUI dependency)

### Key Dependencies

- `react-colorful`: Color picker component
- `@mui/icons-material`: Material Design icons
- `@testing-library/*`: Testing utilities
- `web-vitals`: Performance monitoring

### Development Tools

- **Create React App**: Build tooling and development server
- **ESLint**: Code linting with React-specific rules
- **Jest**: Testing framework
- **TypeScript**: Type checking and compilation

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/               # Basic UI components (closed folder)
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

## State Management

### Centralized State

The application uses React's `useState` for state management with the following key state objects:

- **`appState`**: Main application state including current floor plan, UI state, and settings
- **`floorPlans`**: Collection of all floor plans (persisted to localStorage)
- **`currentFloorPlanName`**: Active floor plan identifier

### Data Persistence

- **localStorage**: Floor plans and app settings
- **sessionStorage**: Undo/redo history (session-specific)

### History Management

- Implements undo/redo functionality with keyboard shortcuts
- History is stored in sessionStorage to prevent memory issues
- Actions that modify floor plans push new states to history

## Core Data Models

### Room Interface

```typescript
interface Room {
  id: string;
  name: string;
  height: number;
  width: number;
  sqFootage: number;
  livability: 'livable' | 'non-livable' | 'outdoor';
  points: Point[];
  x: number;
  y: number;
  isRelative: boolean;
  relativeTo?: string;
  relativeRatio?: number;
}
```

### Furniture Interface

```typescript
interface Furniture extends Room {
  type: string;
}
```

### FloorPlan Interface

```typescript
interface FloorPlan {
  name: string;
  rooms: Room[];
  furniture: Furniture[];
  backgroundImage: string | null;
  imageScale: number;
}
```

## Development Best Practices

### Component Guidelines

1. **Functional Components**: Use function components with hooks
2. **TypeScript**: All components must be typed with proper interfaces
3. **Props Interface**: Define explicit interfaces for component props
4. **Event Handlers**: Use descriptive handler names (e.g., `handleRoomMove`)
5. **Material-UI**: Leverage MUI components and theming system

### Code Organization

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition**: Prefer composition over inheritance
3. **Custom Hooks**: Extract reusable logic into custom hooks when appropriate
4. **Type Safety**: Avoid `any` types, use proper TypeScript interfaces

### State Updates

1. **Immutability**: Always create new objects/arrays for state updates
2. **History Management**: Use `pushToHistory()` for actions that should be undoable
3. **Optimistic Updates**: Update UI immediately, handle persistence separately
4. **Batch Updates**: Group related state changes when possible

### Performance Considerations

1. **React.memo**: Memoize expensive components
2. **useCallback**: Memoize event handlers passed to child components
3. **useMemo**: Memoize expensive calculations
4. **Lazy Loading**: Consider code splitting for large components

## Adding New Features

### Adding a New Component

1. Create component file in `src/components/`
2. Define TypeScript interfaces for props
3. Use Material-UI components and theming
4. Export component from the file
5. Import and use in parent components

### Adding New Room/Furniture Properties

1. Update interfaces in `src/types/index.ts`
2. Update form components (`RoomForm.tsx`, `FurnitureForm.tsx`)
3. Update display components (`RoomDetails.tsx`, `RoomList.tsx`)
4. Handle new properties in state management functions

### Adding New Tools/Modes

1. Update `selectedTool` type in `AppState` interface
2. Add tool UI to appropriate sidebar tab
3. Implement tool logic in `LayoutEditor.tsx`
4. Add keyboard shortcuts if applicable

### Adding New Settings

1. Add property to `AppState` interface
2. Create settings component in `src/components/`
3. Add to toolbar or settings panel
4. Implement persistence logic

## Testing Strategy

### Unit Tests

- Test individual components in isolation
- Mock external dependencies
- Focus on component behavior and props handling

### Integration Tests

- Test component interactions
- Test state management flows
- Test user workflows (add room, move furniture, etc.)

### Testing Tools

- Jest for test runner
- React Testing Library for component testing
- User-event for simulating user interactions

## Build and Deployment

### Development

```bash
npm start          # Start development server
npm test           # Run tests in watch mode
npm run test:ci    # Run tests once (CI mode)
```

### Production

```bash
npm run build      # Create production build
npm run eject      # Eject from CRA (not recommended)
```

### Build Output

- Static files in `build/` directory
- Optimized and minified JavaScript/CSS
- Service worker for caching (if enabled)

## Browser Compatibility

### Minimum Requirements

- ES6+ support (Chrome 51+, Firefox 54+, Safari 10+, Edge 15+)
- Canvas API support
- localStorage/sessionStorage support
- File API for image uploads

### Progressive Enhancement

- Graceful degradation for older browsers
- Feature detection for advanced capabilities
- Responsive design for mobile/tablet

## Performance Optimization

### Bundle Size

- Tree shaking enabled via Create React App
- Material-UI components imported individually when possible
- Consider lazy loading for large feature sets

### Runtime Performance

- Virtual scrolling for large lists (if needed)
- Debounced input handlers
- Optimized canvas rendering
- Efficient state updates

## Security Considerations

### Data Handling

- All data stored locally (no server communication)
- File uploads processed client-side only
- No sensitive data persistence

### Input Validation

- Validate user inputs in forms
- Sanitize file uploads
- Prevent XSS through proper React practices

## Future Enhancements

### Potential Features

- Export to PDF/PNG
- Import from CAD files
- Collaborative editing
- Cloud storage integration
- Mobile app version
- Advanced measurement tools
- 3D visualization

### Technical Improvements

- State management library (Redux/Zustand)
- Server-side rendering (Next.js)
- Progressive Web App features
- Advanced testing coverage
- Performance monitoring
