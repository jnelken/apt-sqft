import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RoomForm } from './RoomForm';

// Characterization tests: these pin how RoomForm enriches BaseForm's payload
// into a room before the submit boundary is typed.

describe('RoomForm', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('derives square footage and livability from the submitted dimensions', () => {
    const onSubmit = jest.fn();
    render(
      <RoomForm
        onSubmit={onSubmit}
        initialValues={{
          name: 'Kitchen',
          height: 120,
          width: 240,
          x: 10,
          y: 20,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toStrictEqual({
      name: 'Kitchen',
      height: 120,
      width: 240,
      sqFootage: (120 * 240) / 144,
      livability: 'livable',
      x: 10,
      y: 20,
    });
  });

  test('submits the room type chosen in the toggle group', () => {
    const onSubmit = jest.fn();
    render(
      <RoomForm
        onSubmit={onSubmit}
        initialValues={{ name: 'Patio', height: 60, width: 60, x: 0, y: 0 }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Outdoor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ livability: 'outdoor' }),
    );
  });

  test('honors a livability passed in as an initial value', () => {
    const onSubmit = jest.fn();
    render(
      <RoomForm
        onSubmit={onSubmit}
        initialValues={{
          name: 'Closet',
          height: 48,
          width: 36,
          x: 1,
          y: 2,
          livability: 'non-livable',
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ livability: 'non-livable' }),
    );
  });

  test('submits generated defaults when adding a room', () => {
    const onSubmit = jest.fn();
    render(<RoomForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Room A',
      height: 120,
      width: 240,
      sqFootage: (120 * 240) / 144,
      livability: 'livable',
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
  });
});
