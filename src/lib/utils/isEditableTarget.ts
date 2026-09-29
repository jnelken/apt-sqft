const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** True when a key event came from a text field, so hotkeys should stay out of the way. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || EDITABLE_TAGS.has(target.tagName);
}
