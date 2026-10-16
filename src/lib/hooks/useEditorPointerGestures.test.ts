import { createRef, type MouseEvent as ReactMouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Furniture, Room } from '@/lib/types';
import { useEditorPointerGestures } from './useEditorPointerGestures';

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

const couch: Furniture = {
  id: 'couch1',
  name: 'Couch',
  type: 'sofa',
  width: 84,
  height: 36,
  sqFootage: 21,
  livability: 'livable',
  points: [],
  x: 24,
  y: 48,
};

const mouse = (
  overrides: Partial<ReactMouseEvent> & {
    clientX?: number;
    clientY?: number;
  } = {},
): ReactMouseEvent =>
  ({
    button: 0,
    altKey: false,
    shiftKey: false,
    clientX: 0,
    clientY: 0,
    stopPropagation: jest.fn(),
    preventDefault: jest.fn(),
    ...overrides,
  }) as unknown as ReactMouseEvent;

const setup = (
  options: {
    editorMode?: 'select' | 'scale' | 'ruler';
    selectedItemId?: string | null;
    rooms?: Room[];
    furniture?: Furniture[];
  } = {},
) => {
  const onItemSelect = jest.fn();
  const onItemMove = jest.fn();
  const onItemResize = jest.fn();
  const onItemScale = jest.fn();
  const contentRef = createRef<HTMLDivElement | null>();
  contentRef.current = document.createElement('div');
  contentRef.current.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 1000,
      height: 1000,
      right: 1000,
      bottom: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;

  const { result, unmount } = renderHook(() =>
    useEditorPointerGestures({
      rooms: options.rooms ?? [room],
      furniture: options.furniture ?? [],
      selectedItemId:
        options.selectedItemId === undefined ? null : options.selectedItemId,
      onItemSelect,
      onItemMove,
      onItemResize,
      onItemScale,
      editorMode: options.editorMode ?? 'select',
      gridSize: 12,
      zoom: 1,
      contentRef,
    }),
  );

  return {
    result,
    unmount,
    onItemSelect,
    onItemMove,
    onItemResize,
    onItemScale,
  };
};

describe('useEditorPointerGestures routing', () => {
  test('select mode: item mouse-down starts a move and selects the item', () => {
    const { result, onItemSelect, onItemMove, onItemScale } = setup({
      selectedItemId: 'room1',
    });
    const event = mouse({ clientX: 0, clientY: 0 });

    act(() => result.current.handleItemMouseDown(event, 'room1'));
    expect(onItemSelect).toHaveBeenCalledWith('room1');
    expect(event.stopPropagation).toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 12, clientY: 0 }),
      );
    });
    expect(onItemMove).toHaveBeenLastCalledWith('room1', 12, 0, true);
    expect(onItemScale).not.toHaveBeenCalled();
  });

  test('scale mode: item mouse-down scales instead of moving', () => {
    const { result, onItemSelect, onItemMove, onItemScale } = setup({
      editorMode: 'scale',
      selectedItemId: 'room1',
    });

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ clientX: 0, clientY: 100 }),
        'room1',
      ),
    );
    expect(onItemSelect).toHaveBeenCalledWith('room1');

    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 0, clientY: 76 }),
      );
    });
    expect(onItemScale).toHaveBeenCalled();
    expect(onItemMove).not.toHaveBeenCalled();
  });

  test('ruler mode: item mouse-down measures instead of moving', () => {
    const { result, onItemSelect, onItemMove } = setup({
      editorMode: 'ruler',
    });

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ clientX: 0, clientY: 0 }),
        'room1',
      ),
    );
    expect(result.current.isRuling).toBe(true);
    expect(onItemSelect).not.toHaveBeenCalled();
    expect(onItemMove).not.toHaveBeenCalled();
  });

  test('Alt+drag on an item starts the ruler in select mode', () => {
    const { result, onItemMove } = setup({ editorMode: 'select' });

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ altKey: true, clientX: 0, clientY: 0 }),
        'room1',
      ),
    );
    expect(result.current.isRuling).toBe(true);
    expect(onItemMove).not.toHaveBeenCalled();
  });

  test('shift+item mouse-down does not start a move (pan is container-owned)', () => {
    const { result, onItemSelect, onItemMove } = setup({
      selectedItemId: 'room1',
    });

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ shiftKey: true, clientX: 0, clientY: 0 }),
        'room1',
      ),
    );
    expect(onItemSelect).not.toHaveBeenCalled();
    expect(onItemMove).not.toHaveBeenCalled();
  });

  test('container shift/right mouse-down pans; plain click clears selection', () => {
    const { result, onItemSelect } = setup({ selectedItemId: 'room1' });

    act(() =>
      result.current.handleContainerMouseDown(
        mouse({ shiftKey: true, clientX: 0, clientY: 0 }),
      ),
    );
    expect(onItemSelect).not.toHaveBeenCalled();
    expect(result.current.viewportOffset).toEqual({ x: 0, y: 0 });

    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 10, clientY: 20 }),
      );
    });
    expect(result.current.viewportOffset).toEqual({ x: 10, y: 20 });

    const { result: result2, onItemSelect: select2 } = setup({
      selectedItemId: 'room1',
    });
    act(() => result2.current.handleContainerMouseDown(mouse()));
    expect(select2).toHaveBeenCalledWith(null);
  });

  test('resize start selects the item and previews off-canvas via window move', () => {
    const { result, onItemSelect, onItemResize } = setup({
      selectedItemId: 'room1',
    });
    const event = mouse();

    act(() => result.current.handleResizeStart(event, 'room1', 'e'));
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onItemSelect).toHaveBeenCalledWith('room1');

    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 30, clientY: 0 }),
      );
    });
    expect(onItemResize).toHaveBeenLastCalledWith('room1', 174, 120, true);
  });

  test('furniture is found and moved the same way as rooms', () => {
    const { result, onItemSelect, onItemMove } = setup({
      rooms: [],
      furniture: [couch],
      selectedItemId: 'couch1',
    });

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ clientX: 0, clientY: 0 }),
        'couch1',
      ),
    );
    expect(onItemSelect).toHaveBeenCalledWith('couch1');

    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 12, clientY: 6 }),
      );
    });
    expect(onItemMove).toHaveBeenLastCalledWith('couch1', 36, 54, true);
  });
});

describe('useEditorPointerGestures window listeners', () => {
  test('attaches window move/up only while a gesture is active, then removes them', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { result } = setup({ selectedItemId: 'room1' });

    const addedBefore = addSpy.mock.calls.filter(
      ([type]) => type === 'mousemove' || type === 'mouseup',
    ).length;
    expect(addedBefore).toBe(0);

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ clientX: 0, clientY: 0 }),
        'room1',
      ),
    );

    const moveAdds = addSpy.mock.calls.filter(([type]) => type === 'mousemove');
    const upAdds = addSpy.mock.calls.filter(([type]) => type === 'mouseup');
    expect(moveAdds.length).toBeGreaterThanOrEqual(1);
    expect(upAdds.length).toBeGreaterThanOrEqual(1);

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });

    const moveRemoves = removeSpy.mock.calls.filter(
      ([type]) => type === 'mousemove',
    );
    const upRemoves = removeSpy.mock.calls.filter(
      ([type]) => type === 'mouseup',
    );
    expect(moveRemoves.length).toBeGreaterThanOrEqual(1);
    expect(upRemoves.length).toBeGreaterThanOrEqual(1);

    addSpy.mockClear();
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 90, clientY: 90 }),
      );
    });
    // Idle: no new listeners from that stray move
    expect(
      addSpy.mock.calls.filter(
        ([type]) => type === 'mousemove' || type === 'mouseup',
      ),
    ).toHaveLength(0);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test('unmount removes window listeners even mid-gesture', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { result, unmount } = setup({ selectedItemId: 'room1' });

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ clientX: 0, clientY: 0 }),
        'room1',
      ),
    );
    unmount();

    expect(removeSpy.mock.calls.some(([type]) => type === 'mousemove')).toBe(
      true,
    );
    expect(removeSpy.mock.calls.some(([type]) => type === 'mouseup')).toBe(
      true,
    );

    removeSpy.mockRestore();
  });

  test('mouseup ends a move with a single grid-snapped commit', () => {
    const { result, onItemMove } = setup({
      selectedItemId: 'room1',
      rooms: [{ ...room, x: 5, y: 19 }],
    });

    act(() =>
      result.current.handleItemMouseDown(
        mouse({ clientX: 0, clientY: 0 }),
        'room1',
      ),
    );
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(onItemMove).toHaveBeenLastCalledWith('room1', 0, 24, false);
  });
});
