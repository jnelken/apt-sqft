import { act, renderHook } from '@testing-library/react';
import { useScaleDrag } from './useScaleDrag';

const base = { x: 0, y: 0, width: 144, height: 120, points: [] };

describe('useScaleDrag', () => {
  test('previews from the original shape and commits once on release', () => {
    const onItemScale = jest.fn();
    const { result } = renderHook(() =>
      useScaleDrag({ zoom: 1, gridSize: 12, onItemScale }),
    );

    act(() => result.current.beginScale({ clientY: 200 }, 'room1', base));
    expect(result.current.isScaling).toBe(true);

    act(() => result.current.updateScale({ clientY: 188 }));
    act(() => result.current.updateScale({ clientY: 176 }));

    // Second move is two steps from the start, not one step from the preview
    expect(onItemScale).toHaveBeenLastCalledWith(
      'room1',
      { width: 168, height: 144, points: [] },
      true,
    );

    act(() => result.current.endScale());
    expect(onItemScale).toHaveBeenLastCalledWith(
      'room1',
      { width: 168, height: 144, points: [] },
      false,
    );
    expect(onItemScale).toHaveBeenCalledTimes(3);
    expect(result.current.isScaling).toBe(false);
  });

  test('a click without movement commits nothing', () => {
    const onItemScale = jest.fn();
    const { result } = renderHook(() =>
      useScaleDrag({ zoom: 1, gridSize: 12, onItemScale }),
    );

    act(() => result.current.beginScale({ clientY: 200 }, 'room1', base));
    act(() => result.current.endScale());

    expect(onItemScale).not.toHaveBeenCalled();
  });
});
