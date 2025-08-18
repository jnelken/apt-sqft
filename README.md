# Floor Plan Editor

A modern, interactive floor plan editor built with React and TypeScript. Create, edit, and visualize apartment layouts with rooms and furniture in a drag-and-drop interface.

## Features

- **Interactive Editor**: Drag and drop rooms and furniture with real-time visual feedback
- **Multi-Floor Plan Support**: Create and manage multiple floor plans with tabbed interface
- **Room Management**: Add, edit, resize, and position rooms with automatic square footage calculation
- **Furniture Placement**: Add and arrange furniture items within your floor plans
- **Background Images**: Import floor plan images as reference backgrounds with scaling controls
- **Customizable Grid**: Adjustable grid system with opacity controls for precise alignment
- **Undo/Redo**: Full history management with keyboard shortcuts (⌘Z/⌘⇧Z)
- **Theme Support**: Light and dark mode themes
- **Color Customization**: Customize wall colors and highlight colors
- **Zoom Controls**: Zoom in/out for detailed editing or overview
- **Responsive Design**: Works on desktop and tablet devices

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The app will open at `http://localhost:3000` in your browser.

## Usage

1. **Create a Floor Plan**: Click the "+" tab to create a new floor plan
2. **Add Rooms**: Use the left sidebar to add rooms with custom dimensions and types
3. **Place Furniture**: Switch to the furniture tab to add chairs, tables, and other items
4. **Import Background**: Upload a floor plan image as a reference background
5. **Customize**: Adjust colors, grid settings, and zoom level to your preference
6. **Save**: Your work is automatically saved to browser localStorage

## Technologies

- React 19 with TypeScript
- Material-UI (MUI) for components and theming
- HTML5 Canvas for interactive editing
- Browser localStorage for data persistence

## Browser Support

Modern browsers with ES6+ support. Tested on Chrome, Firefox, Safari, and Edge.

## Contributing

This project uses standard React development practices. See [PROJECT_SPEC.md](./PROJECT_SPEC.md) for detailed development guidelines and architecture information.

## License

MIT License - feel free to use this project for personal or commercial purposes.
