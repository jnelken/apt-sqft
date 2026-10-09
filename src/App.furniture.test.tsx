import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';
import { FloorPlan, Furniture } from '@/lib/types';

const SOFA: Furniture = {
  id: 'sofa-1',
  name: 'Seeded Sofa',
  type: 'Sofa',
  width: 30,
  height: 40,
  sqFootage: 0,
  livability: 'non-livable',
  points: [],
  x: 0,
  y: 0,
  color: '#123456',
};

const seededPlan: FloorPlan = {
  name: 'Untitled',
  rooms: [],
  furnitureInstances: [{ furnitureId: SOFA.id, x: 10, y: 20 }],
  backgroundImage: null,
  imageScale: 1,
};

const seedStorage = () => {
  localStorage.setItem('floorPlans', JSON.stringify({ Untitled: seededPlan }));
  localStorage.setItem('currentFloorPlanName', 'Untitled');
  localStorage.setItem(
    'appState',
    JSON.stringify({
      floorPlan: seededPlan,
      furnitureInventory: { [SOFA.id]: SOFA },
    }),
  );
  sessionStorage.setItem('history', JSON.stringify([seededPlan]));
  sessionStorage.setItem('historyIndex', '0');
};

const canvasItemsSized = (width: number, height: number) =>
  Array.from(document.querySelectorAll<HTMLElement>('div')).filter(
    (el) =>
      el.style.width === `${width}em` && el.style.height === `${height}em`,
  );

const furnitureList = () =>
  screen.getByText('Furniture List').parentElement as HTMLElement;

describe('App furniture propagation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('furniture added in the sidebar appears in the left list and canvas', () => {
    render(<App />);
    expect(
      within(furnitureList()).getByText('No furniture added'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Add Furniture'));
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Desk' },
    });
    const [heightFeet, heightInches, widthFeet, widthInches] =
      screen.getAllByLabelText(/feet|inches/i);
    fireEvent.change(heightFeet, { target: { value: '2' } });
    fireEvent.change(heightInches, { target: { value: '5' } });
    fireEvent.change(widthFeet, { target: { value: '4' } });
    fireEvent.change(widthInches, { target: { value: '7' } });
    fireEvent.submit(heightFeet.closest('form') as HTMLFormElement);

    expect(within(furnitureList()).getByText('Test Desk')).toBeInTheDocument();
    expect(canvasItemsSized(55, 29)).toHaveLength(1);
  });

  test('deleting and undoing furniture updates the left list and canvas together', () => {
    seedStorage();
    render(<App />);

    expect(
      within(furnitureList()).getByText('Seeded Sofa'),
    ).toBeInTheDocument();
    const [onCanvas] = canvasItemsSized(30, 40);
    expect(onCanvas.style.left).toBe('10em');
    expect(onCanvas.style.top).toBe('20em');

    fireEvent.click(within(furnitureList()).getByText('Seeded Sofa'));
    fireEvent.keyDown(window, { key: 'Delete' });

    expect(within(furnitureList()).queryByText('Seeded Sofa')).toBeNull();
    expect(canvasItemsSized(30, 40)).toHaveLength(0);

    fireEvent.keyDown(window, { key: 'z', metaKey: true });

    expect(
      within(furnitureList()).getByText('Seeded Sofa'),
    ).toBeInTheDocument();
    expect(canvasItemsSized(30, 40)).toHaveLength(1);
  });
});
