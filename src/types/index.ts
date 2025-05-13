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
  isLivable: boolean;
  points: Point[];
  x: number;
  y: number;
  isRelative: boolean;
  relativeTo?: string;
  relativeRatio?: number;
}

export interface Furniture extends Room {
  type: string;
}

export interface FloorPlan {
  name: string;
  rooms: Room[];
  furniture: Furniture[];
  backgroundImage: string | null;
  imageScale: number;
  gridSize: number;
  gridOpacity: number;
}

export interface AppState {
  floorPlan: FloorPlan;
  selectedRoomId: string | null;
  selectedTool: 'select' | 'move' | 'resize' | 'add-point';
  zoom: number;
  theme: 'light' | 'dark';
}
