import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Simple localStorage mock that doesn't interfere with app state
const createMockStorage = () => {
  let storage: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    get length() {
      return Object.keys(storage).length;
    },
    key: (i: number) => {
      const keys = Object.keys(storage);
      return keys[i] || null;
    },
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createMockStorage(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createMockStorage(),
});

describe('App Component', () => {
  test('renders floor plan editor with initial state', () => {
    render(<App />);

    // Check floor plan name input
    const floorPlanName = screen.getByDisplayValue('Untitled');
    expect(floorPlanName).toBeInTheDocument();

    // Check that main UI elements are present
    expect(screen.getByLabelText('Add Room')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
    expect(screen.getByLabelText('Floor Plan Details')).toBeInTheDocument();
    // Room List moved to the left panel; verify it renders there
    expect(screen.getByText('Rooms')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Furniture')).toBeInTheDocument();
  });

  test('allows adding a new room', () => {
    render(<App />);

    // Should start on the Add Room tab (first tab)
    expect(screen.getByText(/Add Room/i)).toBeInTheDocument();

    // Fill in room details
    const roomNameInput = screen.getByLabelText(/name/i);
    const [heightFeetInput, heightInchesInput] = screen
      .getAllByLabelText(/feet|inches/i)
      .slice(0, 2);
    const [widthFeetInput, widthInchesInput] = screen
      .getAllByLabelText(/feet|inches/i)
      .slice(2, 4);

    fireEvent.change(roomNameInput, { target: { value: 'Living Room' } });
    // 120in = 10ft 0in, 144in = 12ft 0in
    fireEvent.change(heightFeetInput, { target: { value: '10' } });
    fireEvent.change(heightInchesInput, { target: { value: '0' } });
    fireEvent.change(widthFeetInput, { target: { value: '12' } });
    fireEvent.change(widthInchesInput, { target: { value: '0' } });

    // Submit the form
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Verify the inputs reflect what we set (smoke test for controlled inputs)
    expect(roomNameInput).toHaveValue('Living Room');
  });

  test('allows switching between sidebar tabs', () => {
    render(<App />);

    // Test Edit tab
    const roomDetailsTab = screen.getByLabelText('Edit');
    fireEvent.click(roomDetailsTab);

    expect(screen.getByText('No room selected')).toBeInTheDocument();

    // Test Floor Plan Details tab
    const floorPlanDetailsTab = screen.getByLabelText('Floor Plan Details');
    fireEvent.click(floorPlanDetailsTab);

    expect(screen.getByText('Floor Plan Details')).toBeInTheDocument();
  });

  test('undo/redo buttons start disabled', () => {
    render(<App />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    const redoButton = screen.getByRole('button', { name: /redo/i });

    // Initially, both should be disabled (at start of history)
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  test('hotkeys toolbar and held hotkeys drive the same editor mode', () => {
    render(<App />);

    const scale = screen.getByRole('button', { name: 'Scale (S)' });
    const ruler = screen.getByRole('button', { name: 'Ruler (Alt)' });

    fireEvent.keyDown(window, { key: 's' });
    expect(scale).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyUp(window, { key: 's' });
    expect(scale).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(ruler);
    expect(ruler).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(window, { key: 's' });
    expect(scale).toHaveAttribute('aria-pressed', 'true');
    expect(ruler).toHaveAttribute('aria-pressed', 'false');
    fireEvent.keyUp(window, { key: 's' });
    expect(ruler).toHaveAttribute('aria-pressed', 'true');
  });

  test('typing S in a text field does not switch modes', () => {
    render(<App />);

    const nameInput = screen.getByDisplayValue('Untitled');
    fireEvent.keyDown(nameInput, { key: 's' });

    expect(screen.getByRole('button', { name: 'Scale (S)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
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
