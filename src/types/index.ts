export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  start: Point;
  end: Point;
}

export interface Room {
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

export interface Furniture extends Room {
  type: string;
  color?: string; // Custom furniture color (hex format)
}

export interface FurnitureTemplate {
  id: string;
  name: string;
  type: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultColor: string;
  category: 'seating' | 'tables' | 'storage' | 'bedroom' | 'other';
  icon?: string;
}

export interface FloorPlan {
  name: string;
  rooms: Room[];
  furnitureInstances: FurnitureInstance[];
  backgroundImage: string | null;
  imageScale: number;
}

export interface FurnitureInventory {
  [furnitureId: string]: Furniture;
}

export interface FurnitureInstance {
  furnitureId: string; // Reference to furniture in inventory
  x: number;
  y: number;
  rotation?: number; // For future use
}

export interface AppState {
  floorPlan: FloorPlan;
  furnitureInventory: FurnitureInventory;
  selectedRoomId: string | null;
  selectedTool: 'select' | 'move' | 'resize' | 'add-point' | 'edit';
  zoom: number;
  theme: 'light' | 'dark';
  highlightColor: string;
  wallColor: string;
  gridSize: number;
  gridOpacity: number;
  history: FloorPlan[];
  historyIndex: number;
}
