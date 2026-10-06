import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { LayoutEditor } from './LayoutEditor';
import { EditorMode, Furniture, Room } from '@/lib/types';

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
  color: '#336699',
  width: 84,
  height: 36,
  sqFootage: 21,
  livability: 'livable',
  points: [],
  x: 24,
  y: 48,
};

const renderEditor = (
  editorMode: EditorMode,
  selectedRoomId: string | null = null,
  items: { rooms?: Room[]; furniture?: Furniture[] } = {},
) => {
  const props = {
    rooms: items.rooms ?? [room],
    furniture: items.furniture ?? [],
    selectedRoomId,
    onRoomSelect: jest.fn(),
    onRoomMove: jest.fn(),
    onRoomResize: jest.fn(),
    onRoomScale: jest.fn(),
    editorMode,
    gridSize: 12,
    gridOpacity: 0.2,
    zoom: 1,
    backgroundImage: null,
    imageScale: 1,
    wallColor: '#000',
    highlightColor: '#0ff',
  };
  const utils = render(<LayoutEditor {...props} />);
  const canvas = utils.container.querySelector('.LayoutEditor') as HTMLElement;
  const roomElement = canvas.querySelector(
    '[style*="width: 144em"]',
  ) as HTMLElement;
  return { ...utils, props, canvas, roomElement };
};

const rulerLine = (container: HTMLElement) =>
  container.querySelector('svg line');

describe('LayoutEditor editor modes', () => {
  test('select mode: a plain drag on empty space does not measure', () => {
    const { canvas, container, props } = renderEditor('select');

    fireEvent.mouseDown(canvas, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(canvas, { clientX: 36, clientY: 0 });

    expect(rulerLine(container)).toBeNull();
    expect(props.onRoomSelect).toHaveBeenCalledWith(null);
  });

  test('select mode: Alt+drag still measures', () => {
    const { canvas, container } = renderEditor('select');

    fireEvent.mouseDown(canvas, {
      button: 0,
      altKey: true,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.mouseMove(canvas, { clientX: 36, clientY: 0 });

    expect(rulerLine(container)).not.toBeNull();
    expect(container).toHaveTextContent(`3' 0" (36")`);
  });

  test('ruler mode: a plain drag measures without holding Alt', () => {
    const { canvas, container, props } = renderEditor('ruler');

    fireEvent.mouseDown(canvas, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(canvas, { clientX: 36, clientY: 0 });
    fireEvent.mouseUp(canvas);

    expect(rulerLine(container)).not.toBeNull();
    expect(props.onRoomSelect).not.toHaveBeenCalled();
  });

  test('ruler mode: dragging over a room measures instead of moving it', () => {
    const { roomElement, canvas, container, props } = renderEditor('ruler');

    fireEvent.mouseDown(roomElement, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(canvas, { clientX: 24, clientY: 0 });

    expect(rulerLine(container)).not.toBeNull();
    expect(props.onRoomMove).not.toHaveBeenCalled();
  });

  test('scale mode: dragging a room up scales it in grid steps, then commits', () => {
    const { roomElement, canvas, props } = renderEditor('scale');

    fireEvent.mouseDown(roomElement, { button: 0, clientX: 0, clientY: 100 });
    expect(props.onRoomSelect).toHaveBeenCalledWith('room1');

    fireEvent.mouseMove(canvas, { clientX: 0, clientY: 76 });
    expect(props.onRoomScale).toHaveBeenLastCalledWith(
      'room1',
      { width: 168, height: 144, points: [] },
      true,
    );

    fireEvent.mouseUp(canvas);
    expect(props.onRoomScale).toHaveBeenLastCalledWith(
      'room1',
      { width: 168, height: 144, points: [] },
      false,
    );
    expect(props.onRoomMove).not.toHaveBeenCalled();
    expect(props.onRoomResize).not.toHaveBeenCalled();
  });

  test.each([
    ['select', 4],
    ['scale', 0],
    ['ruler', 0],
  ] as const)('%s mode shows %i resize handles', (mode, count) => {
    const { roomElement } = renderEditor(mode, 'room1');
    expect(roomElement.querySelectorAll(':scope > div')).toHaveLength(count);
  });

  test('select mode: dragging a room moves it rather than scaling', () => {
    const { roomElement, canvas, props } = renderEditor('select');

    fireEvent.mouseDown(roomElement, { button: 0, clientX: 0, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 0, clientY: 76 });

    expect(props.onRoomScale).not.toHaveBeenCalled();
  });
});

const itemElement = (canvas: HTMLElement, width: number) =>
  canvas.querySelector(`[style*="width: ${width}em"]`) as HTMLElement;

describe('LayoutEditor item rendering', () => {
  test('a livable room is transparent, positioned in em, with wall-colored borders', () => {
    const { roomElement } = renderEditor('select');

    expect(roomElement).toHaveStyle({
      left: '0em',
      top: '0em',
      width: '144em',
      height: '120em',
      borderColor: '#000',
      backgroundColor: 'transparent',
      opacity: '0.5',
    });
  });

  test('a non-livable room is shaded and hatched', () => {
    const { roomElement } = renderEditor('select', null, {
      rooms: [{ ...room, livability: 'non-livable' }],
    });

    expect(roomElement).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.5)' });
    const itemRules = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .map((rule) => rule.cssText)
      .filter((cssText) =>
        Array.from(roomElement.classList).some((name) =>
          cssText.startsWith(`.${name} {`),
        ),
      );
    expect(itemRules.join('')).toContain('repeating-linear-gradient');
  });

  test('a selected room uses the highlight fill and a blue border', () => {
    const { roomElement } = renderEditor('scale', 'room1');

    expect(roomElement).toHaveStyle({
      backgroundColor: '#0ff',
      borderColor: '#2196f3',
    });
  });

  test('furniture is opaque and filled with its own color', () => {
    const { canvas } = renderEditor('select', null, { furniture: [couch] });
    const couchElement = itemElement(canvas, 84);

    expect(couchElement).toHaveStyle({
      left: '24em',
      top: '48em',
      height: '36em',
      borderColor: '#000',
      backgroundColor: '#336699',
      opacity: '1',
    });
  });

  test('furniture without a color falls back to orange', () => {
    const { canvas } = renderEditor('select', null, {
      furniture: [{ ...couch, color: undefined }],
    });

    expect(itemElement(canvas, 84)).toHaveStyle({ backgroundColor: '#FFA500' });
  });

  test('selected furniture uses the highlight fill and a blue border', () => {
    const { canvas } = renderEditor('select', 'couch1', { furniture: [couch] });

    expect(itemElement(canvas, 84)).toHaveStyle({
      backgroundColor: '#0ff',
      borderColor: '#2196f3',
    });
  });

  test.each([
    ['select', ''],
    ['scale', 'ns-resize'],
    ['ruler', 'crosshair'],
  ] as const)('%s mode gives items the cursor "%s"', (mode, cursor) => {
    const { roomElement, canvas } = renderEditor(mode, null, {
      furniture: [couch],
    });

    expect(roomElement.style.cursor).toBe(cursor);
    expect(itemElement(canvas, 84).style.cursor).toBe(cursor);
  });

  test.each([
    ['select', 4],
    ['scale', 0],
    ['ruler', 0],
  ] as const)(
    '%s mode shows %i resize handles on selected furniture',
    (mode, count) => {
      const { canvas } = renderEditor(mode, 'couch1', { furniture: [couch] });
      expect(
        itemElement(canvas, 84).querySelectorAll(':scope > div'),
      ).toHaveLength(count);
    },
  );

  test('only the selected item gets resize handles', () => {
    const { roomElement, canvas } = renderEditor('select', 'couch1', {
      furniture: [couch],
    });

    expect(roomElement.querySelectorAll(':scope > div')).toHaveLength(0);
    expect(
      itemElement(canvas, 84).querySelectorAll(':scope > div'),
    ).toHaveLength(4);
  });

  // The west handle's ns-resize cursor is today's behavior, pinned as-is.
  test('resize handles sit on the east, west, north and south walls, in that order', () => {
    const { roomElement } = renderEditor('select', 'room1');
    const handles = Array.from(
      roomElement.querySelectorAll(':scope > div'),
    ) as HTMLElement[];

    expect(handles[0]).toHaveStyle({ right: '-5px', cursor: 'ew-resize' });
    expect(handles[1]).toHaveStyle({ left: '-5px', cursor: 'ns-resize' });
    expect(handles[2]).toHaveStyle({ top: '-5px', cursor: 'ns-resize' });
    expect(handles[3]).toHaveStyle({ bottom: '-5px', cursor: 'ns-resize' });
  });
});

describe('LayoutEditor item mouse-down routing', () => {
  test('mouse-down on furniture selects it and drags it without clearing the selection', () => {
    const { canvas, props } = renderEditor('select', 'couch1', {
      furniture: [couch],
    });

    fireEvent.mouseDown(itemElement(canvas, 84), {
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    expect(props.onRoomSelect).toHaveBeenCalledTimes(1);
    expect(props.onRoomSelect).toHaveBeenCalledWith('couch1');

    fireEvent.mouseMove(canvas, { clientX: 12, clientY: 6 });
    expect(props.onRoomMove).toHaveBeenLastCalledWith('couch1', 36, 54, true);
  });

  test.each([
    [0, { clientX: 24, clientY: 0 }, ['room1', 168, 120, true], null],
    [
      1,
      { clientX: 24, clientY: 0 },
      ['room1', 120, 120, true],
      ['room1', 24, 0, true],
    ],
    [
      2,
      { clientX: 0, clientY: 24 },
      ['room1', 144, 96, true],
      ['room1', 0, 24, true],
    ],
    [3, { clientX: 0, clientY: 24 }, ['room1', 144, 144, true], null],
  ] as const)(
    'mouse-down on resize handle %i resizes from that wall',
    (index, move, resizeCall, moveCall) => {
      const { roomElement, canvas, props } = renderEditor('select', 'room1');
      const handle = roomElement.querySelectorAll(':scope > div')[index];

      fireEvent.mouseDown(handle, { button: 0, clientX: 0, clientY: 0 });
      expect(props.onRoomSelect).toHaveBeenCalledTimes(1);
      expect(props.onRoomSelect).toHaveBeenCalledWith('room1');

      fireEvent.mouseMove(canvas, move);
      expect(props.onRoomResize).toHaveBeenLastCalledWith(...resizeCall);
      if (moveCall) {
        expect(props.onRoomMove).toHaveBeenLastCalledWith(...moveCall);
      } else {
        expect(props.onRoomMove).not.toHaveBeenCalled();
      }
    },
  );
});
