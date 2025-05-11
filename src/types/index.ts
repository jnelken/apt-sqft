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
  rooms: Room[];
  furniture: Furniture[];
  gridSize: number;
}

export interface AppState {
  floorPlan: FloorPlan;
  selectedRoomId: string | null;
  selectedTool: 'select' | 'move' | 'resize' | 'add-point';
  gridSize: number;
  zoom: number;
  theme: 'light' | 'dark';
  backgroundImage: string | null;
  imageScale: number;
}
