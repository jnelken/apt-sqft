import { Furniture } from '@/lib/types';
import { getFurnitureFromInstances } from './getFurnitureFromInstances';

const chair: Furniture = {
  id: 'chair',
  name: 'Chair',
  type: 'Chair',
  width: 20,
  height: 20,
  sqFootage: 0,
  livability: 'non-livable',
  points: [],
  x: 0,
  y: 0,
};

describe('getFurnitureFromInstances', () => {
  test('places each instance at its own position', () => {
    const result = getFurnitureFromInstances(
      [
        { furnitureId: 'chair', x: 5, y: 6 },
        { furnitureId: 'chair', x: 50, y: 60 },
      ],
      { chair },
    );

    expect(result).toEqual([
      { ...chair, x: 5, y: 6 },
      { ...chair, x: 50, y: 60 },
    ]);
  });

  test('drops instances whose furniture is missing from the inventory', () => {
    const result = getFurnitureFromInstances(
      [
        { furnitureId: 'gone', x: 1, y: 1 },
        { furnitureId: 'chair', x: 2, y: 3 },
      ],
      { chair },
    );

    expect(result).toEqual([{ ...chair, x: 2, y: 3 }]);
  });

  test('does not mutate the inventory entry', () => {
    getFurnitureFromInstances([{ furnitureId: 'chair', x: 9, y: 9 }], {
      chair,
    });

    expect(chair.x).toBe(0);
    expect(chair.y).toBe(0);
  });
});
