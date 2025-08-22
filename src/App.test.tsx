import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Simple localStorage mock that doesn't interfere with app state
const createMockStorage = () => {
  let storage: Record<string, string> = {};
  return {
    getItem: (key: string) => key in storage ? storage[key] : null,
    setItem: (key: string, value: string) => storage[key] = value || '',
    removeItem: (key: string) => delete storage[key],
    get length() { return Object.keys(storage).length; },
    key: (i: number) => {
      const keys = Object.keys(storage);
      return keys[i] || null;
    },
    clear: () => storage = {}
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createMockStorage(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createMockStorage(),
});

describe('App Component', () => {
  test.only('renders floor plan editor with initial state', () => {
    render(<App />);

    // Check floor plan name input
    const floorPlanName = screen.getByDisplayValue('Untitled');
    expect(floorPlanName).toBeInTheDocument();

    // Check that main UI elements are present
    expect(screen.getByText('Grid Size')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Room')).toBeInTheDocument();
    expect(screen.getByLabelText('Room Details')).toBeInTheDocument();
  });

  test('allows adding a new room', () => {
    render(<App />);

    // Should start on the Add Room tab (first tab)
    expect(screen.getByText('Room Name')).toBeInTheDocument();

    // Fill in room details
    const roomNameInput = screen.getByLabelText(/room name/i);
    const widthInput = screen.getByLabelText(/width/i);
    const heightInput = screen.getByLabelText(/height/i);

    fireEvent.change(roomNameInput, { target: { value: 'Living Room' } });
    fireEvent.change(widthInput, { target: { value: '144' } });
    fireEvent.change(heightInput, { target: { value: '120' } });

    // Submit the form
    const addButton = screen.getByRole('button', { name: /add room/i });
    fireEvent.click(addButton);

    // Room should be added (we can test form reset)
    expect(roomNameInput).toHaveValue('');
  });

  test('allows switching between sidebar tabs', () => {
    render(<App />);

    // Test Room Details tab
    const roomDetailsTab = screen.getByLabelText('Room Details');
    fireEvent.click(roomDetailsTab);

    expect(screen.getByText('No room selected')).toBeInTheDocument();

    // Test Floor Plan Details tab
    const floorPlanDetailsTab = screen.getByLabelText('Floor Plan Details');
    fireEvent.click(floorPlanDetailsTab);

    expect(screen.getByText('Floor Plan Details')).toBeInTheDocument();
  });

  test('undo/redo buttons start disabled', () => {
    render(<App />);

    const undoButton = screen.getByLabelText(/undo/i);
    const redoButton = screen.getByLabelText(/redo/i);

    // Initially, both should be disabled (at start of history)
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  test('handles keyboard shortcuts without crashing', () => {
    render(<App />);

    // Test undo shortcut
    fireEvent.keyDown(window, { key: 'z', metaKey: true });

    // Test redo shortcut
    fireEvent.keyDown(window, { key: 'z', metaKey: true, shiftKey: true });

    // Test delete key
    fireEvent.keyDown(window, { key: 'Delete' });

    // Should not throw errors when nothing is selected
    expect(screen.getByDisplayValue('Untitled')).toBeInTheDocument();
  });
});
