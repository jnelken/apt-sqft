import { act, renderHook } from '@testing-library/react';
import { holdKeyMode, useEditorMode } from './useEditorMode';

const press = (key: string, init: KeyboardEventInit = {}) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }));
  });

const release = (key: string) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', { key }));
  });

describe('holdKeyMode', () => {
  test('maps S to scale and Alt to ruler', () => {
    expect(holdKeyMode(new KeyboardEvent('keydown', { key: 's' }))).toBe(
      'scale',
    );
    expect(holdKeyMode(new KeyboardEvent('keydown', { key: 'S' }))).toBe(
      'scale',
    );
    expect(holdKeyMode(new KeyboardEvent('keydown', { key: 'Alt' }))).toBe(
      'ruler',
    );
  });

  test('ignores S combined with a command modifier', () => {
    expect(
      holdKeyMode(new KeyboardEvent('keydown', { key: 's', metaKey: true })),
    ).toBeNull();
    expect(
      holdKeyMode(new KeyboardEvent('keydown', { key: 's', ctrlKey: true })),
    ).toBeNull();
    expect(holdKeyMode(new KeyboardEvent('keydown', { key: 'a' }))).toBeNull();
  });
});

describe('useEditorMode', () => {
  test('starts in select mode', () => {
    const { result } = renderHook(() => useEditorMode());
    expect(result.current.editorMode).toBe('select');
  });

  test('holding S activates scale mode until released', () => {
    const { result } = renderHook(() => useEditorMode());
    press('s');
    expect(result.current.editorMode).toBe('scale');
    release('s');
    expect(result.current.editorMode).toBe('select');
  });

  test('holding Alt activates ruler mode until released', () => {
    const { result } = renderHook(() => useEditorMode());
    press('Alt');
    expect(result.current.editorMode).toBe('ruler');
    release('Alt');
    expect(result.current.editorMode).toBe('select');
  });

  test('releasing a held key restores a mode chosen from the toolbar', () => {
    const { result } = renderHook(() => useEditorMode());
    act(() => result.current.setEditorMode('scale'));
    press('Alt');
    expect(result.current.editorMode).toBe('ruler');
    release('Alt');
    expect(result.current.editorMode).toBe('scale');
  });

  test('choosing a mode while a key is held sticks after release', () => {
    const { result } = renderHook(() => useEditorMode());
    press('s');
    act(() => result.current.setEditorMode('ruler'));
    release('s');
    expect(result.current.editorMode).toBe('ruler');
  });

  test('ignores hotkeys typed into text fields', () => {
    const { result } = renderHook(() => useEditorMode());
    const input = document.createElement('input');
    document.body.appendChild(input);
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', bubbles: true }),
      );
    });
    expect(result.current.editorMode).toBe('select');
    input.remove();
  });

  test('window blur releases a held key', () => {
    const { result } = renderHook(() => useEditorMode());
    press('Alt');
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(result.current.editorMode).toBe('select');
  });
});
