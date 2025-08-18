# Design Document

## Overview

The Enhanced Furniture System will transform the existing basic furniture functionality into a comprehensive, user-friendly system that provides visual customization, intuitive drag-and-drop placement, consistent editing capabilities, and detailed statistics tracking. The design leverages the existing room management architecture while extending it with furniture-specific enhancements.

## Architecture

### Current State Analysis

The existing system has:

- Basic furniture support through `Furniture` interface extending `Room`
- Simple form-based furniture creation (`FurnitureForm`)
- Basic list display (`FurnitureList`)
- Canvas rendering with orange color hardcoded (`#FFA500`)
- Furniture treated as non-livable rooms with zero square footage

### Enhanced Architecture

The enhanced system will maintain the existing `Furniture extends Room` pattern while adding:

- **Color Management System**: Intelligent color selection with complementary defaults
- **Drag-and-Drop Panel**: Left sidebar furniture palette with draggable items
- **Enhanced Statistics**: Comprehensive furniture metrics calculation
- **Visual Improvements**: Better rendering with customizable colors and improved UX

## Components and Interfaces

### 1. Enhanced Type Definitions

```typescript
// Extend existing Furniture interface
interface Furniture extends Room {
  type: string;
  color?: string; // New: Custom furniture color
}

// New: Furniture template for drag-and-drop
interface FurnitureTemplate {
  id: string;
  name: string;
  type: string;
  defaultWidth: number;
  defaultHeight: number;
  icon?: string;
}
```

### 2. Color Management System

**Integration with Existing Color Picker**:

- Reuse existing color picker component from `ColorSettings`
- Extend `ColorSettings` to support furniture color selection when furniture is selected
- Integrate with existing color picker infrastructure (likely `react-colorful`)
- Add furniture color controls to the existing color settings panel
- Default color algorithm: Generate warm tones (reds, oranges, browns) that complement the existing wall color

**Algorithm for Default Colors**:

```typescript
const generateComplementaryFurnitureColor = (wallColor: string): string => {
  // Convert wall color to HSL
  // Shift hue by 30-60 degrees toward warm spectrum
  // Adjust saturation and lightness for furniture visibility
  // Return complementary color (default: warm red/orange tones)
};
```

### 3. Furniture Palette Panel

**Component**: `FurniturePalette`

- Replaces current left panel furniture tab
- Displays draggable furniture templates
- Organized by furniture type (Seating, Tables, Storage, etc.)
- Visual icons/previews for each furniture type
- Drag initiation with visual feedback

**Furniture Templates**:

```typescript
const FURNITURE_TEMPLATES: FurnitureTemplate[] = [
  {
    id: 'sofa',
    name: 'Sofa',
    type: 'Sofa',
    defaultWidth: 84,
    defaultHeight: 36,
  },
  {
    id: 'chair',
    name: 'Chair',
    type: 'Chair',
    defaultWidth: 24,
    defaultHeight: 24,
  },
  {
    id: 'table',
    name: 'Dining Table',
    type: 'Table',
    defaultWidth: 60,
    defaultHeight: 36,
  },
  // ... more templates
];
```

### 4. Enhanced Layout Editor

**Modifications to `LayoutEditor`**:

- **Drop Zone Handling**: Accept furniture drops from palette
- **Visual Feedback**: Show drop preview during drag operations
- **Color Rendering**: Use furniture.color instead of hardcoded orange
- **Improved Furniture Styling**: Better visual distinction from rooms

**New Features**:

- Drop zone validation (prevent dropping outside canvas)
- Drag preview with semi-transparent furniture outline
- Snap-to-grid for dropped furniture
- Visual feedback for valid/invalid drop zones

### 5. Enhanced Statistics System

**Component**: `EnhancedFloorPlanDetails`

- Extends existing `FloorPlanDetails`
- Adds furniture-specific statistics
- Calculates furniture density metrics

**New Statistics**:

- Total furniture square footage
- Number of furniture items
- Furniture density (furniture sq ft / room sq ft)
- Furniture by type breakdown
- Average furniture size

### 6. Unified Editing Experience

**Enhanced Integration**:

- Furniture uses same editing interface as rooms (`RoomForm` → `FurnitureForm`)
- Consistent property panels and controls
- Unified selection and manipulation behavior
- Same undo/redo integration

## Data Models

### Enhanced Furniture Interface

```typescript
interface Furniture extends Room {
  type: string;
  color: string; // New: Custom color (hex format)
  templateId?: string; // New: Reference to template used
}
```

### Furniture Template System

```typescript
interface FurnitureTemplate {
  id: string;
  name: string;
  type: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultColor: string;
  category: 'seating' | 'tables' | 'storage' | 'bedroom' | 'other';
  icon?: string;
}
```

### Enhanced App State

```typescript
// No changes to core AppState - furniture color stored in Furniture objects
// Templates stored as static data or configuration
```

## Error Handling

### Drag and Drop Error Scenarios

1. **Invalid Drop Location**:

   - Show visual feedback for invalid zones
   - Return furniture to palette on invalid drop
   - Display user-friendly error messages

2. **Canvas Boundary Violations**:

   - Prevent furniture placement outside visible canvas
   - Auto-adjust position to nearest valid location
   - Maintain furniture within zoom/pan boundaries

3. **Color Selection Failures**:
   - Fallback to default furniture color if complementary calculation fails
   - Graceful handling of invalid color values
   - Preserve existing colors during updates

### Data Persistence Errors

1. **localStorage Quota Exceeded**:

   - Graceful degradation of color data
   - Prioritize core furniture data over color preferences
   - User notification of storage limitations

2. **Color Data Corruption**:
   - Validate color values on load
   - Reset to defaults for invalid colors
   - Maintain backward compatibility with existing furniture

## Testing Strategy

### Unit Tests

1. **Color Management**:

   - Test complementary color generation algorithm
   - Validate color format conversions (hex, HSL, RGB)
   - Test color picker component interactions

2. **Furniture Templates**:

   - Validate template data structure
   - Test template-to-furniture conversion
   - Verify default property application

3. **Statistics Calculations**:
   - Test furniture square footage calculations
   - Validate furniture count aggregations
   - Test statistics with edge cases (zero furniture, large numbers)

### Integration Tests

1. **Drag and Drop Flow**:

   - Test complete drag-from-palette-to-canvas flow
   - Verify furniture creation with correct properties
   - Test drop validation and error handling

2. **Editing Consistency**:

   - Test furniture editing using room editing interface
   - Verify property updates and persistence
   - Test undo/redo with furniture operations

3. **Visual Rendering**:
   - Test furniture color application in canvas
   - Verify furniture selection and highlighting
   - Test furniture rendering with different themes

### User Experience Tests

1. **Color Selection UX**:

   - Test color picker usability
   - Verify complementary color suggestions
   - Test color changes with immediate visual feedback

2. **Drag and Drop UX**:

   - Test drag initiation and visual feedback
   - Verify drop zone clarity and feedback
   - Test error scenarios and user guidance

3. **Statistics Display**:
   - Test statistics accuracy and formatting
   - Verify real-time updates as furniture changes
   - Test statistics with various furniture configurations

## Implementation Phases

### Phase 1: Color System Foundation

- Implement furniture color property
- Extend existing ColorSettings component to support furniture colors
- Develop complementary color algorithm
- Update furniture rendering to use custom colors

### Phase 2: Drag and Drop Infrastructure

- Create furniture template system
- Implement furniture palette component
- Add drag and drop handling to LayoutEditor
- Implement drop validation and feedback

### Phase 3: Enhanced Statistics

- Extend FloorPlanDetails with furniture statistics
- Implement furniture square footage calculations
- Add furniture count and density metrics
- Create furniture breakdown by type

### Phase 4: Integration and Polish

- Integrate all components into main application
- Ensure consistent editing experience
- Add comprehensive error handling
- Implement testing suite
- Performance optimization and final polish
