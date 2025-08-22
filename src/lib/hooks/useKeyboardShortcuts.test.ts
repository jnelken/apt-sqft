import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const defaultProps = {
    handleUndo: jest.fn(),
    handleRedo: jest.fn(),
    handleDeleteSelected: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls handleUndo on Cmd+Z', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
    });
    
    window.dispatchEvent(event);

    expect(defaultProps.handleUndo).toHaveBeenCalledTimes(1);
    expect(defaultProps.handleRedo).not.toHaveBeenCalled();
  });

  test('calls handleRedo on Cmd+Shift+Z', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
      shiftKey: true,
    });
    
    window.dispatchEvent(event);

    expect(defaultProps.handleRedo).toHaveBeenCalledTimes(1);
    expect(defaultProps.handleUndo).not.toHaveBeenCalled();
  });

  test('calls handleRedo on Cmd+Y', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const event = new KeyboardEvent('keydown', {
      key: 'y',
      metaKey: true,
    });
    
    window.dispatchEvent(event);

    expect(defaultProps.handleRedo).toHaveBeenCalledTimes(1);
  });

  test('calls handleUndo on Ctrl+Z (Windows/Linux)', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    });
    
    window.dispatchEvent(event);

    expect(defaultProps.handleUndo).toHaveBeenCalledTimes(1);
  });

  test('calls handleDeleteSelected on Delete key', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const event = new KeyboardEvent('keydown', {
      key: 'Delete',
    });
    
    window.dispatchEvent(event);

    expect(defaultProps.handleDeleteSelected).toHaveBeenCalledTimes(1);
  });

  test('calls handleDeleteSelected on Backspace key', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
    });
    
    window.dispatchEvent(event);

    expect(defaultProps.handleDeleteSelected).toHaveBeenCalledTimes(1);
  });

  test('does not trigger handlers for unrelated keys', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const event = new KeyboardEvent('keydown', {
      key: 'a',
    });
    
    window.dispatchEvent(event);

    expect(defaultProps.handleUndo).not.toHaveBeenCalled();
    expect(defaultProps.handleRedo).not.toHaveBeenCalled();
    expect(defaultProps.handleDeleteSelected).not.toHaveBeenCalled();
  });

  test('prevents default behavior for keyboard shortcuts', () => {
    renderHook(() => useKeyboardShortcuts(defaultProps));

    const undoEvent = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
    });
    const preventDefaultSpy = jest.spyOn(undoEvent, 'preventDefault');
    
    window.dispatchEvent(undoEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('removes event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useKeyboardShortcuts(defaultProps));
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });

  test('updates handlers when dependencies change', () => {
    const newHandleUndo = jest.fn();
    const newProps = { ...defaultProps, handleUndo: newHandleUndo };
    
    const { rerender } = renderHook(
      (props) => useKeyboardShortcuts(props),
      { initialProps: defaultProps }
    );

    // Test with original handler
    const firstEvent = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
    });
    window.dispatchEvent(firstEvent);
    expect(defaultProps.handleUndo).toHaveBeenCalledTimes(1);
    expect(newHandleUndo).not.toHaveBeenCalled();

    // Update props
    rerender(newProps);

    // Test with new handler
    const secondEvent = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
    });
    window.dispatchEvent(secondEvent);
    expect(newHandleUndo).toHaveBeenCalledTimes(1);
    expect(defaultProps.handleUndo).toHaveBeenCalledTimes(1); // Should not be called again
  });
});