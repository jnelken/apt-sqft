/**
 * Formats a single length (given in total inches) for display.
 * Used by the ruler overlay to show measurements in two forms.
 */

/** e.g. 63 -> `5' 3"`, 24 -> `2' 0"`, 8 -> `0' 8"` */
export function feetInchesLabel(totalInches: number): string {
  const rounded = Math.round(totalInches);
  const feet = Math.floor(rounded / 12);
  const inches = rounded % 12;
  return `${feet}' ${inches}"`;
}

/** e.g. 62.7 -> `63"` */
export function inchesLabel(totalInches: number): string {
  return `${Math.round(totalInches)}"`;
}
