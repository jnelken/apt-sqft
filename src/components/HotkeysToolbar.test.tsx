import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { HotkeysToolbar } from './HotkeysToolbar';

describe('HotkeysToolbar', () => {
  test('renders an accessible toolbar with labelled Scale and Ruler buttons', () => {
    render(
      <HotkeysToolbar editorMode="select" onEditorModeChange={jest.fn()} />,
    );

    expect(
      screen.getByRole('toolbar', { name: 'Hotkeys' }),
    ).toBeInTheDocument();
    const scale = screen.getByRole('button', { name: 'Scale (S)' });
    const ruler = screen.getByRole('button', { name: 'Ruler (Alt)' });
    expect(scale).toHaveAttribute('aria-pressed', 'false');
    expect(ruler).toHaveAttribute('aria-pressed', 'false');
    expect(scale).toHaveTextContent('S');
    expect(ruler).toHaveTextContent('Alt');
  });

  test('marks the active mode as pressed', () => {
    render(
      <HotkeysToolbar editorMode="ruler" onEditorModeChange={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Ruler (Alt)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Scale (S)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('clicking a button selects its mode', () => {
    const onEditorModeChange = jest.fn();
    render(
      <HotkeysToolbar
        editorMode="select"
        onEditorModeChange={onEditorModeChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Scale (S)' }));
    expect(onEditorModeChange).toHaveBeenCalledWith('scale');
  });

  test('clicking the active button returns to select mode', () => {
    const onEditorModeChange = jest.fn();
    render(
      <HotkeysToolbar
        editorMode="scale"
        onEditorModeChange={onEditorModeChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Scale (S)' }));
    expect(onEditorModeChange).toHaveBeenCalledWith('select');
  });
});
