import { useCallback } from 'react';
import { FloorPlan, AppState } from '@/lib/types';

const initialFloorPlan: FloorPlan = {
  name: 'Untitled',
  rooms: [],
  furnitureInstances: [],
  backgroundImage: null,
  imageScale: 1,
};

interface UseFloorPlanManagerProps {
  floorPlans: { [key: string]: FloorPlan };
  setFloorPlans: React.Dispatch<React.SetStateAction<{ [key: string]: FloorPlan }>>;
  currentFloorPlanName: string;
  setCurrentFloorPlanName: React.Dispatch<React.SetStateAction<string>>;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  pushToHistory: (newFloorPlan: FloorPlan) => void;
}

interface UseFloorPlanManagerReturn {
  handleFloorPlanSelect: (name: string) => void;
  handleNameChange: (name: string) => void;
  handleDelete: () => void;
  handleNewFloorPlan: () => void;
  handleImageUpload: (file: File) => void;
  handleImageScaleChange: (scale: number) => void;
}

export const useFloorPlanManager = ({
  floorPlans,
  setFloorPlans,
  currentFloorPlanName,
  setCurrentFloorPlanName,
  appState,
  setAppState,
  pushToHistory,
}: UseFloorPlanManagerProps): UseFloorPlanManagerReturn => {
  const handleFloorPlanSelect = useCallback((name: string) => {
    // Save current floor plan state
    setFloorPlans(prev => ({
      ...prev,
      [currentFloorPlanName]: appState.floorPlan,
    }));

    // Load selected floor plan
    setCurrentFloorPlanName(name);
    pushToHistory(floorPlans[name]);
  }, [
    setFloorPlans,
    currentFloorPlanName,
    appState.floorPlan,
    setCurrentFloorPlanName,
    pushToHistory,
    floorPlans,
  ]);

  const handleNameChange = useCallback((name: string) => {
    // If the name is changing, we need to update the floor plans object
    if (name !== currentFloorPlanName) {
      const newFloorPlans = { ...floorPlans };
      // Remove the old name entry
      delete newFloorPlans[currentFloorPlanName];
      // Add the new name entry
      newFloorPlans[name] = { ...appState.floorPlan, name };
      setFloorPlans(newFloorPlans);
      setCurrentFloorPlanName(name);
    }

    const newFloorPlan = { ...appState.floorPlan, name };
    pushToHistory(newFloorPlan);
  }, [
    currentFloorPlanName,
    floorPlans,
    appState.floorPlan,
    setFloorPlans,
    setCurrentFloorPlanName,
    pushToHistory,
  ]);

  const handleDelete = useCallback(() => {
    // Remove the current floor plan
    const newFloorPlans = { ...floorPlans };
    delete newFloorPlans[currentFloorPlanName];
    setFloorPlans(newFloorPlans);

    // Switch to the first available floor plan or create a new one
    const remainingNames = Object.keys(newFloorPlans);
    if (remainingNames.length > 0) {
      setCurrentFloorPlanName(remainingNames[0]);
      setAppState(prev => ({
        ...prev,
        floorPlan: newFloorPlans[remainingNames[0]],
      }));
    } else {
      setCurrentFloorPlanName('Untitled');
      setAppState(prev => ({
        ...prev,
        floorPlan: initialFloorPlan,
      }));
    }
  }, [
    floorPlans,
    currentFloorPlanName,
    setFloorPlans,
    setCurrentFloorPlanName,
    setAppState,
  ]);

  const handleNewFloorPlan = useCallback(() => {
    // Generate a unique name for the new floor plan
    const baseName = 'Untitled';
    let newName = baseName;
    let counter = 1;
    while (floorPlans[newName]) {
      newName = `${baseName} ${counter}`;
      counter++;
    }

    // Save current floor plan state
    setFloorPlans(prev => ({
      ...prev,
      [currentFloorPlanName]: appState.floorPlan,
    }));

    // Create new floor plan
    const newFloorPlan = {
      ...initialFloorPlan,
      name: newName,
    };

    setFloorPlans(prev => ({
      ...prev,
      [newName]: newFloorPlan,
    }));

    // Switch to the new floor plan
    setCurrentFloorPlanName(newName);
    setAppState(prev => ({
      ...prev,
      floorPlan: newFloorPlan,
    }));
  }, [
    floorPlans,
    setFloorPlans,
    currentFloorPlanName,
    appState.floorPlan,
    setCurrentFloorPlanName,
    setAppState,
  ]);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const newName =
        appState.floorPlan.name === 'Untitled'
          ? file.name.replace(/\.[^/.]+$/, '') // Remove file extension
          : appState.floorPlan.name;

      // Update floor plans object with new name
      const newFloorPlans = { ...floorPlans };
      delete newFloorPlans[appState.floorPlan.name];
      newFloorPlans[newName] = {
        ...appState.floorPlan,
        name: newName,
        backgroundImage: e.target?.result as string,
      };
      setFloorPlans(newFloorPlans);
      setCurrentFloorPlanName(newName);

      // Update app state
      setAppState(prev => ({
        ...prev,
        floorPlan: {
          ...prev.floorPlan,
          name: newName,
          backgroundImage: e.target?.result as string,
        },
      }));
    };
    reader.readAsDataURL(file);
  }, [
    appState.floorPlan,
    floorPlans,
    setFloorPlans,
    setCurrentFloorPlanName,
    setAppState,
  ]);

  const handleImageScaleChange = useCallback((scale: number) => {
    setAppState(prev => ({
      ...prev,
      floorPlan: { ...prev.floorPlan, imageScale: scale },
    }));
  }, [setAppState]);

  return {
    handleFloorPlanSelect,
    handleNameChange,
    handleDelete,
    handleNewFloorPlan,
    handleImageUpload,
    handleImageScaleChange,
  };
};