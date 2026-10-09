import { Furniture, FurnitureInstance, FurnitureInventory } from '@/lib/types';

/** Joins a floor plan's instances against the inventory; dangling ids are dropped. */
export const getFurnitureFromInstances = (
  instances: FurnitureInstance[],
  inventory: FurnitureInventory,
): Furniture[] => {
  return instances
    .map((instance) => {
      const furniture = inventory[instance.furnitureId];
      if (!furniture) return null;
      return {
        ...furniture,
        x: instance.x,
        y: instance.y,
      };
    })
    .filter((furniture): furniture is Furniture => furniture !== null);
};
