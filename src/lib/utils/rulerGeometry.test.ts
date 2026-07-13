import {
  clientToData,
  projectToContainer,
  distanceInches,
  snapPoint,
  midpoint,
} from './rulerGeometry';

describe('clientToData', () => {
  test('subtracts the content origin and divides by zoom', () => {
    const data = clientToData(
      { clientX: 130, clientY: 220 },
      { left: 30, top: 20 },
      2,
    );
    expect(data).toEqual({ x: 50, y: 100 });
  });

  test('is identity at zoom 1 with zero origin', () => {
    expect(
      clientToData({ clientX: 12, clientY: 34 }, { left: 0, top: 0 }, 1),
    ).toEqual({ x: 12, y: 34 });
  });
});

describe('projectToContainer', () => {
  test('accounts for content offset, container offset and zoom', () => {
    const px = projectToContainer(
      { x: 50, y: 100 },
      { left: 30, top: 20 },
      { left: 10, top: 5 },
      2,
    );
    expect(px).toEqual({ x: 30 - 10 + 100, y: 20 - 5 + 200 });
  });
});

describe('clientToData + projectToContainer round-trip', () => {
  test('recovers the container-relative screen point', () => {
    const contentOrigin = { left: 40, top: 25 };
    const containerOrigin = { left: 10, top: 5 };
    const zoom = 1.5;
    const client = { clientX: 200, clientY: 160 };

    const data = clientToData(client, contentOrigin, zoom);
    const px = projectToContainer(data, contentOrigin, containerOrigin, zoom);

    // Projected point should equal the client point relative to the container.
    expect(px.x).toBeCloseTo(client.clientX - containerOrigin.left);
    expect(px.y).toBeCloseTo(client.clientY - containerOrigin.top);
  });
});

describe('distanceInches', () => {
  test('computes euclidean distance', () => {
    expect(distanceInches({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  test('is zero for identical points', () => {
    expect(distanceInches({ x: 7, y: 9 }, { x: 7, y: 9 })).toBe(0);
  });
});

describe('snapPoint', () => {
  test('rounds each axis to the nearest grid multiple', () => {
    expect(snapPoint({ x: 13, y: 25 }, 12)).toEqual({ x: 12, y: 24 });
    expect(snapPoint({ x: 18, y: 30 }, 12)).toEqual({ x: 24, y: 36 });
  });
});

describe('midpoint', () => {
  test('averages both axes', () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
  });
});
