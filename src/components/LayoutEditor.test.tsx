import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { LayoutEditor } from './LayoutEditor';
import { EditorMode, Room } from '@/lib/types';

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

const renderEditor = (
  editorMode: EditorMode,
  selectedRoomId: string | null = null,
) => {
  const props = {
    rooms: [room],
    furniture: [],
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
