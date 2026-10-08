import { act, renderHook } from '@testing-library/react';
import { Room } from '@/lib/types';
import { useItemDragResize } from './useItemDragResize';

const room: Room = {
  id: 'room1',
  name: 'Kitchen',
  width: 144,
  height: 120,
  sqFootage: 120,
  livability: 'livable',
  points: [],
  x: 0,
  y: 0,
};

const setup = (
  item: Room = room,
  options: { zoom?: number; selectedItemId?: string | null } = {},
) => {
  const onItemMove = jest.fn();
  const onItemResize = jest.fn();
  const findItem = (id: string) => (id === item.id ? item : undefined);
  const { result } = renderHook(() =>
    useItemDragResize({
      zoom: options.zoom ?? 1,
      gridSize: 12,
      selectedItemId:
        options.selectedItemId === undefined ? item.id : options.selectedItemId,
      findItem,
      onItemMove,
      onItemResize,
    }),
  );
  return { result, onItemMove, onItemResize };
};

const at = (clientX: number, clientY: number) => ({ clientX, clientY });

describe('useItemDragResize', () => {
  test('a move previews by the zoom-scaled delta, then snaps on release', () => {
    const { result, onItemMove, onItemResize } = setup(
      { ...room, x: 5, y: 19 },
      { zoom: 2 },
    );

    act(() => result.current.beginMove(at(0, 0)));
    expect(result.current.isDragging).toBe(true);

    act(() => result.current.updateDrag(at(10, 4)));
    expect(onItemMove).toHaveBeenLastCalledWith('room1', 10, 21, true);

    act(() => result.current.endDrag());
    expect(onItemMove).toHaveBeenLastCalledWith('room1', 0, 24, false);
    expect(onItemResize).not.toHaveBeenCalled();
    expect(result.current.isDragging).toBe(false);
  });

  test('each move is measured from the previous pointer position', () => {
    const { result, onItemMove } = setup();

    act(() => result.current.beginMove(at(0, 0)));
    act(() => result.current.updateDrag(at(10, 0)));
    act(() => result.current.updateDrag(at(15, 0)));

    expect(onItemMove).toHaveBeenLastCalledWith('room1', 5, 0, true);
  });

  test('without a selected item a move does nothing', () => {
    const { result, onItemMove } = setup(room, { selectedItemId: null });

    act(() => result.current.beginMove(at(0, 0)));
    act(() => result.current.updateDrag(at(10, 0)));
    act(() => result.current.endDrag());

    expect(onItemMove).not.toHaveBeenCalled();
  });

  test.each([
    ['e', at(24, 0), ['room1', 168, 120, true], null],
    ['w', at(24, 0), ['room1', 120, 120, true], ['room1', 24, 0, true]],
    ['s', at(0, 24), ['room1', 144, 144, true], null],
    ['n', at(0, 24), ['room1', 144, 96, true], ['room1', 0, 24, true]],
  ] as const)(
    'dragging the %s wall resizes from that wall',
    (wall, move, resizeCall, moveCall) => {
      const { result, onItemMove, onItemResize } = setup();

      act(() => result.current.beginResize(at(0, 0), wall));
      act(() => result.current.updateDrag(move));

      expect(onItemResize).toHaveBeenLastCalledWith(...resizeCall);
      if (moveCall) {
        expect(onItemMove).toHaveBeenLastCalledWith(...moveCall);
      } else {
        expect(onItemMove).not.toHaveBeenCalled();
      }
    },
  );

  test('a resize never shrinks below one grid square', () => {
    const { result, onItemMove, onItemResize } = setup();

    act(() => result.current.beginResize(at(0, 0), 'w'));
    act(() => result.current.updateDrag(at(500, 0)));

    expect(onItemResize).toHaveBeenLastCalledWith('room1', 12, 120, true);
    expect(onItemMove).toHaveBeenLastCalledWith('room1', 500, 0, true);
  });

  test.each([
    ['e', { width: 150 }, ['room1', 156, 120, false], null],
    ['w', { width: 150 }, ['room1', 156, 120, false], ['room1', -6, 0, false]],
    ['w', { width: 140 }, ['room1', 144, 120, false], ['room1', -4, 0, false]],
    ['s', { height: 125 }, ['room1', 144, 120, false], null],
    ['n', { height: 125 }, ['room1', 144, 120, false], ['room1', 0, 5, false]],
    ['n', { height: 130 }, ['room1', 144, 132, false], ['room1', 0, -2, false]],
  ] as const)(
    'releasing the %s wall snaps the size %j, keeping the opposite wall fixed',
    (wall, size, resizeCall, moveCall) => {
      const { result, onItemMove, onItemResize } = setup({ ...room, ...size });

      act(() => result.current.beginResize(at(0, 0), wall));
      act(() => result.current.endDrag());

      expect(onItemResize).toHaveBeenLastCalledWith(...resizeCall);
      if (moveCall) {
        expect(onItemMove).toHaveBeenLastCalledWith(...moveCall);
      } else {
        expect(onItemMove).not.toHaveBeenCalled();
      }
    },
  );

  test('a pan accumulates the zoom-scaled offset and stops on release', () => {
    const { result, onItemMove } = setup(room, { zoom: 2 });

    act(() => result.current.beginPan(at(0, 0)));
    expect(result.current.isPanning).toBe(true);

    act(() => result.current.updateDrag(at(10, 20)));
    act(() => result.current.updateDrag(at(30, 40)));
    expect(result.current.viewportOffset).toEqual({ x: 15, y: 20 });

    act(() => result.current.endDrag());
    act(() => result.current.updateDrag(at(90, 90)));
    expect(result.current.isPanning).toBe(false);
    expect(result.current.viewportOffset).toEqual({ x: 15, y: 20 });
    expect(onItemMove).not.toHaveBeenCalled();
  });

  test('pointer moves before any gesture starts are ignored', () => {
    const { result, onItemMove, onItemResize } = setup();

    act(() => result.current.updateDrag(at(10, 10)));

    expect(onItemMove).not.toHaveBeenCalled();
    expect(onItemResize).not.toHaveBeenCalled();
    expect(result.current.viewportOffset).toEqual({ x: 0, y: 0 });
  });
});
