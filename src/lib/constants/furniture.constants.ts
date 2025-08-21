import { FurnitureTemplate } from './types';

export const FURNITURE_TEMPLATES: FurnitureTemplate[] = [
  // Seating
  {
    id: 'sofa',
    name: 'Sofa',
    type: 'Sofa',
    defaultWidth: 84, // 7 feet
    defaultHeight: 36, // 3 feet
    defaultColor: '#8B4513', // Saddle brown
    category: 'seating',
  },
  {
    id: 'chair',
    name: 'Chair',
    type: 'Chair',
    defaultWidth: 24, // 2 feet
    defaultHeight: 24, // 2 feet
    defaultColor: '#A0522D', // Sienna
    category: 'seating',
  },
  {
    id: 'loveseat',
    name: 'Loveseat',
    type: 'Sofa',
    defaultWidth: 60, // 5 feet
    defaultHeight: 36, // 3 feet
    defaultColor: '#8B4513', // Saddle brown
    category: 'seating',
  },

  // Tables
  {
    id: 'dining-table',
    name: 'Dining Table',
    type: 'Table',
    defaultWidth: 60, // 5 feet
    defaultHeight: 36, // 3 feet
    defaultColor: '#654321', // Dark brown
    category: 'tables',
  },
  {
    id: 'coffee-table',
    name: 'Coffee Table',
    type: 'Table',
    defaultWidth: 48, // 4 feet
    defaultHeight: 24, // 2 feet
    defaultColor: '#654321', // Dark brown
    category: 'tables',
  },
  {
    id: 'side-table',
    name: 'Side Table',
    type: 'Table',
    defaultWidth: 18, // 1.5 feet
    defaultHeight: 18, // 1.5 feet
    defaultColor: '#654321', // Dark brown
    category: 'tables',
  },

  // Storage
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    type: 'Bookshelf',
    defaultWidth: 36, // 3 feet
    defaultHeight: 12, // 1 foot
    defaultColor: '#8B4513', // Saddle brown
    category: 'storage',
  },
  {
    id: 'dresser',
    name: 'Dresser',
    type: 'Dresser',
    defaultWidth: 60, // 5 feet
    defaultHeight: 18, // 1.5 feet
    defaultColor: '#8B4513', // Saddle brown
    category: 'storage',
  },
  {
    id: 'cabinet',
    name: 'Cabinet',
    type: 'Cabinet',
    defaultWidth: 36, // 3 feet
    defaultHeight: 24, // 2 feet
    defaultColor: '#8B4513', // Saddle brown
    category: 'storage',
  },

  // Bedroom
  {
    id: 'queen-bed',
    name: 'Queen Bed',
    type: 'Bed',
    defaultWidth: 60, // 5 feet
    defaultHeight: 80, // 6.67 feet
    defaultColor: '#D2691E', // Chocolate
    category: 'bedroom',
  },
  {
    id: 'king-bed',
    name: 'King Bed',
    type: 'Bed',
    defaultWidth: 76, // 6.33 feet
    defaultHeight: 80, // 6.67 feet
    defaultColor: '#D2691E', // Chocolate
    category: 'bedroom',
  },
  {
    id: 'nightstand',
    name: 'Nightstand',
    type: 'Table',
    defaultWidth: 18, // 1.5 feet
    defaultHeight: 16, // 1.33 feet
    defaultColor: '#654321', // Dark brown
    category: 'bedroom',
  },

  // Other
  {
    id: 'desk',
    name: 'Desk',
    type: 'Desk',
    defaultWidth: 48, // 4 feet
    defaultHeight: 24, // 2 feet
    defaultColor: '#654321', // Dark brown
    category: 'other',
  },
  {
    id: 'tv-stand',
    name: 'TV Stand',
    type: 'TV Stand',
    defaultWidth: 48, // 4 feet
    defaultHeight: 16, // 1.33 feet
    defaultColor: '#8B4513', // Saddle brown
    category: 'other',
  },
];
