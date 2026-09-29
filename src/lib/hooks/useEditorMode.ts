import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorMode } from '@/lib/types';
import { isEditableTarget } from '@/lib/utils/isEditableTarget';

/** Which mode a held key activates, or null if the key isn't a mode hotkey. */
export function holdKeyMode(e: KeyboardEvent): EditorMode | null {
  if (e.key === 'Alt') return 'ruler';
  if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    return 'scale';
  }
  return null;
}

interface HeldKey {
  key: string;
  previous: EditorMode;
}

/**
 * Owns the canvas editor mode. Toolbar buttons set it directly; holding a
 * hotkey (S for scale, Alt for ruler) switches to that mode until the key is
 * released, then restores whatever mode was active before.
 */
export function useEditorMode() {
  const [editorMode, setMode] = useState<EditorMode>('select');
  const modeRef = useRef<EditorMode>(editorMode);
  const heldKeyRef = useRef<HeldKey | null>(null);

  useEffect(() => {
    modeRef.current = editorMode;
  }, [editorMode]);

  const setEditorMode = useCallback((mode: EditorMode) => {
    heldKeyRef.current = null;
    setMode(mode);
  }, []);

  useEffect(() => {
    const releaseHeldKey = () => {
      const held = heldKeyRef.current;
      if (!held) return;
      heldKeyRef.current = null;
      setMode(held.previous);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || heldKeyRef.current || isEditableTarget(e.target)) return;
      const mode = holdKeyMode(e);
      if (!mode) return;
      heldKeyRef.current = {
        key: e.key.toLowerCase(),
        previous: modeRef.current,
      };
      setMode(mode);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (heldKeyRef.current?.key === e.key.toLowerCase()) releaseHeldKey();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releaseHeldKey);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', releaseHeldKey);
    };
  }, []);

  return { editorMode, setEditorMode };
}
