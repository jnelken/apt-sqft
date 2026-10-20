import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ItemForm } from './ItemForm';
import { QUEEN_BED } from '@/lib/constants/furniture.constants';

// Characterization tests: these pin how ItemForm enriches BaseForm's payload
// into a room or a furniture item before the submit boundary is typed.

describe('ItemForm', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('label="Room"', () => {
    test('derives square footage and livability from the submitted dimensions', () => {
      const onSubmit = jest.fn();
      render(
        <ItemForm
          label="Room"
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
        <ItemForm
          label="Room"
          onSubmit={onSubmit}
          initialValues={{ name: 'Patio', height: 60, width: 60, x: 0, y: 0 }}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Outdoor' }));
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ livability: 'outdoor', x: 0, y: 0 }),
      );
    });

    test('submits generated defaults when adding a room', () => {
      const onSubmit = jest.fn();
      render(<ItemForm label="Room" onSubmit={onSubmit} />);

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

  describe('label="Furniture"', () => {
    test('submits the default template type, size and color', () => {
      const onSubmit = jest.fn();
      render(<ItemForm label="Furniture" onSubmit={onSubmit} />);

      // Furniture always seeds BaseForm with template dimensions, so BaseForm
      // treats it as an edit and labels the submit button "Update".
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toStrictEqual({
        name: 'Furniture A',
        height: QUEEN_BED.defaultHeight,
        width: QUEEN_BED.defaultWidth,
        sqFootage: 0,
        livability: 'non-livable',
        type: 'Bed',
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        color: QUEEN_BED.defaultColor,
      });
    });

    test('keeps a color passed in as an initial value', () => {
      const onSubmit = jest.fn();
      render(
        <ItemForm
          label="Furniture"
          onSubmit={onSubmit}
          initialValues={{
            name: 'Sofa',
            height: 36,
            width: 84,
            x: 7,
            y: 8,
            type: 'Sofa',
            color: '#123456',
          }}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sofa',
          height: 36,
          width: 84,
          type: 'Sofa',
          color: '#123456',
          x: 7,
          y: 8,
        }),
      );
    });

    test('submits the type selected from the dropdown, leaving dimensions as first seeded', () => {
      const onSubmit = jest.fn();
      render(<ItemForm label="Furniture" onSubmit={onSubmit} />);

      fireEvent.mouseDown(screen.getByRole('combobox'));
      fireEvent.click(screen.getByRole('option', { name: 'Desk' }));
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Desk',
          // BaseForm seeds its dimension state once, so picking a new type
          // does not change the submitted size today.
          height: QUEEN_BED.defaultHeight,
          width: QUEEN_BED.defaultWidth,
        }),
      );
    });

    test('collapses the feet/inches selectors into total inches', () => {
      const onSubmit = jest.fn();
      render(<ItemForm label="Furniture" onSubmit={onSubmit} />);

      // Height feet, height inches, width feet, width inches — in render order.
      const [heightFeet, heightInches, widthFeet, widthInches] =
        screen.getAllByRole('spinbutton');
      fireEvent.change(heightFeet, { target: { value: '6' } });
      fireEvent.change(heightInches, { target: { value: '8' } });
      fireEvent.change(widthFeet, { target: { value: '5' } });
      fireEvent.change(widthInches, { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: 'Update' }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ height: 6 * 12 + 8, width: 5 * 12 }),
      );
    });
  });
});
