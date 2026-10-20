import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BaseForm } from './BaseForm';

// Characterization tests: these pin what BaseForm already submits today so the
// submit payload can be given a precise type without changing behavior.

/** Height feet, height inches, width feet, width inches — in render order. */
const dimensionInputs = () => screen.getAllByRole('spinbutton');

const setDimensions = (values: [number, number, number, number]): void => {
  dimensionInputs().forEach((input, index) => {
    fireEvent.change(input, { target: { value: String(values[index]) } });
  });
};

describe('BaseForm', () => {
  beforeEach(() => {
    // generateName() picks a letter from Math.random, so pin it for add mode.
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('submits only name, height, width, x and y', () => {
    const onSubmit = jest.fn();
    render(
      <BaseForm
        label="Room"
        initialValues={{
          name: 'Kitchen',
          height: 120,
          width: 240,
          x: 10,
          y: 20,
        }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    // Key set is the contract: no heightFeet/widthInches leak out of the form.
    expect(Object.keys(payload).sort()).toEqual([
      'height',
      'name',
      'width',
      'x',
      'y',
    ]);
    expect(payload).toStrictEqual({
      name: 'Kitchen',
      height: 120,
      width: 240,
      x: 10,
      y: 20,
    });
  });

  test('collapses the feet/inches selectors into total inches', () => {
    const onSubmit = jest.fn();
    render(
      <BaseForm
        label="Room"
        initialValues={{ name: 'Den', height: 120, width: 240, x: 0, y: 0 }}
        onSubmit={onSubmit}
      />,
    );

    setDimensions([10, 6, 8, 3]);
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ height: 10 * 12 + 6, width: 8 * 12 + 3 }),
    );
  });

  test('preserves the position it was given, including zero', () => {
    const onSubmit = jest.fn();
    render(
      <BaseForm
        label="Furniture"
        initialValues={{ name: 'Bed', height: 80, width: 60, x: 0, y: 0 }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0, y: 0 }),
    );
  });

  test('submits generated defaults when no initial values are given', () => {
    const onSubmit = jest.fn();
    render(<BaseForm label="Room" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Room A',
      height: 120,
      width: 240,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
  });

  test('submits the edited name', () => {
    const onSubmit = jest.fn();
    render(
      <BaseForm
        label="Room"
        initialValues={{ name: 'Kitchen', height: 120, width: 240, x: 5, y: 6 }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Pantry' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Pantry' }),
    );
  });
});
