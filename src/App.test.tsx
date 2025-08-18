import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders floor plan editor', () => {
  render(<App />);
  const floorPlanName = screen.getByDisplayValue('Untitled');
  expect(floorPlanName).toBeInTheDocument();
});
