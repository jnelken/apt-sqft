import { FurnitureTemplate } from '../types';

// Individual furniture constants
export const SOFA: FurnitureTemplate = {
  id: 'sofa',
  name: 'Sofa',
  type: 'Sofa',
  defaultWidth: 84, // 7 feet
  defaultHeight: 36, // 3 feet
  defaultColor: '#8B4513', // Saddle brown
  category: 'seating',
};

export const CHAIR: FurnitureTemplate = {
  id: 'chair',
  name: 'Chair',
  type: 'Chair',
  defaultWidth: 24, // 2 feet
  defaultHeight: 24, // 2 feet
  defaultColor: '#A0522D', // Sienna
  category: 'seating',
};

export const LOVESEAT: FurnitureTemplate = {
  id: 'loveseat',
  name: 'Loveseat',
  type: 'Sofa',
  defaultWidth: 60, // 5 feet
  defaultHeight: 36, // 3 feet
  defaultColor: '#8B4513', // Saddle brown
  category: 'seating',
};

export const DINING_TABLE: FurnitureTemplate = {
  id: 'dining-table',
  name: 'Dining Table',
  type: 'Table',
  defaultWidth: 60, // 5 feet
  defaultHeight: 36, // 3 feet
  defaultColor: '#654321', // Dark brown
  category: 'tables',
};

export const COFFEE_TABLE: FurnitureTemplate = {
  id: 'coffee-table',
  name: 'Coffee Table',
  type: 'Table',
  defaultWidth: 48, // 4 feet
  defaultHeight: 24, // 2 feet
  defaultColor: '#654321', // Dark brown
  category: 'tables',
};

export const SIDE_TABLE: FurnitureTemplate = {
  id: 'side-table',
  name: 'Side Table',
  type: 'Table',
  defaultWidth: 18, // 1.5 feet
  defaultHeight: 18, // 1.5 feet
  defaultColor: '#654321', // Dark brown
  category: 'tables',
};

export const BOOKSHELF: FurnitureTemplate = {
  id: 'bookshelf',
  name: 'Bookshelf',
  type: 'Bookshelf',
  defaultWidth: 36, // 3 feet
  defaultHeight: 12, // 1 foot
  defaultColor: '#8B4513', // Saddle brown
  category: 'storage',
};

export const DRESSER: FurnitureTemplate = {
  id: 'dresser',
  name: 'Dresser',
  type: 'Dresser',
  defaultWidth: 60, // 5 feet
  defaultHeight: 18, // 1.5 feet
  defaultColor: '#8B4513', // Saddle brown
  category: 'storage',
};

export const CABINET: FurnitureTemplate = {
  id: 'cabinet',
  name: 'Cabinet',
  type: 'Cabinet',
  defaultWidth: 36, // 3 feet
  defaultHeight: 24, // 2 feet
  defaultColor: '#8B4513', // Saddle brown
  category: 'storage',
};

export const QUEEN_BED: FurnitureTemplate = {
  id: 'queen-bed',
  name: 'Queen Bed',
  type: 'Bed',
  defaultWidth: 60, // 5 feet
  defaultHeight: 80, // 6.67 feet
  defaultColor: '#D2691E', // Chocolate
  category: 'bedroom',
};

export const KING_BED: FurnitureTemplate = {
  id: 'king-bed',
  name: 'King Bed',
  type: 'Bed',
  defaultWidth: 76, // 6.33 feet
  defaultHeight: 80, // 6.67 feet
  defaultColor: '#D2691E', // Chocolate
  category: 'bedroom',
};

export const NIGHTSTAND: FurnitureTemplate = {
  id: 'nightstand',
  name: 'Nightstand',
  type: 'Table',
  defaultWidth: 18, // 1.5 feet
  defaultHeight: 16, // 1.33 feet
  defaultColor: '#654321', // Dark brown
  category: 'bedroom',
};

export const DESK: FurnitureTemplate = {
  id: 'desk',
  name: 'Desk',
  type: 'Desk',
  defaultWidth: 48, // 4 feet
  defaultHeight: 24, // 2 feet
  defaultColor: '#654321', // Dark brown
  category: 'other',
};

export const TV_STAND: FurnitureTemplate = {
  id: 'tv-stand',
  name: 'TV Stand',
  type: 'TV Stand',
  defaultWidth: 48, // 4 feet
  defaultHeight: 16, // 1.33 feet
  defaultColor: '#8B4513', // Saddle brown
  category: 'other',
};

// Create the map from individual constants
export const FURNITURE_TEMPLATES_MAP: Record<string, FurnitureTemplate> = {
  [SOFA.id]: SOFA,
  [CHAIR.id]: CHAIR,
  [LOVESEAT.id]: LOVESEAT,
  [DINING_TABLE.id]: DINING_TABLE,
  [COFFEE_TABLE.id]: COFFEE_TABLE,
  [SIDE_TABLE.id]: SIDE_TABLE,
  [BOOKSHELF.id]: BOOKSHELF,
  [DRESSER.id]: DRESSER,
  [CABINET.id]: CABINET,
  [QUEEN_BED.id]: QUEEN_BED,
  [KING_BED.id]: KING_BED,
  [NIGHTSTAND.id]: NIGHTSTAND,
  [DESK.id]: DESK,
  [TV_STAND.id]: TV_STAND,
};

// Create the array from the map values
export const FURNITURE_TEMPLATES: FurnitureTemplate[] = Object.values(
  FURNITURE_TEMPLATES_MAP,
);

// Get unique furniture types from templates
export const FURNITURE_TYPES = Array.from(
  new Set(FURNITURE_TEMPLATES.map(template => template.type)),
).sort();
