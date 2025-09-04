export function formatInitialDimensions(height: number = 0, width: number = 0) {
  return {
    heightFeet: Math.floor(height / 12),
    heightInches: height % 12,
    widthFeet: Math.floor(width / 12),
    widthInches: width % 12,
  };
}
