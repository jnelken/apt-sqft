# Technology Stack

## Core Technologies

- **React 19**: Latest React with concurrent features and hooks
- **TypeScript 4.9**: Static typing for enhanced developer experience
- **Material-UI v7**: Component library and theming system
- **Emotion**: CSS-in-JS styling (MUI dependency)
- **Create React App**: Build tooling and development server

## Key Dependencies

- `react-colorful`: Color picker component
- `@mui/icons-material`: Material Design icons
- `@testing-library/*`: Testing utilities (Jest DOM, React, User Event)
- `web-vitals`: Performance monitoring

## Development Tools

- **ESLint**: Code linting with React-specific rules
- **Jest**: Testing framework
- **TypeScript**: Type checking and compilation

## Build System

The project uses Create React App (CRA) which provides:

- Webpack bundling with optimizations
- Babel transpilation
- Hot module replacement in development
- Production build optimization
- Built-in testing setup

## Common Commands

```bash
# Development
npm start          # Start development server at http://localhost:3000
npm test           # Run tests in watch mode
npm run test:ci    # Run tests once (CI mode)

# Production
npm run build      # Create optimized production build in build/
npm run eject      # Eject from CRA (not recommended)
```

## Browser Compatibility

- **Minimum Requirements**: ES6+ support (Chrome 51+, Firefox 54+, Safari 10+, Edge 15+)
- **Required APIs**: Canvas API, localStorage/sessionStorage, File API for image uploads
- **Progressive Enhancement**: Graceful degradation for older browsers

## Performance Considerations

- Tree shaking enabled via CRA
- Material-UI components imported individually when possible
- Canvas-based rendering for interactive editor
- Local storage for data persistence (no server required)
