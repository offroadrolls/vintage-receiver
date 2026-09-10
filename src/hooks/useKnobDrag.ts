"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PointerHandlers = {
  onPointerDown: (event: React.PointerEvent) => void;
};

/**
 * Converts vertical/horizontal drag into a 0–1 value for knobs.
 * Vertical drag up increases; horizontal drag right increases.
 */
export function useKnobDrag(
  value: number,
  onChange: (next: number) => void,
  options?: {
    sensitivity?: number;
    disabled?: boolean;
    onCommit?: (next: number) => void;
  }
): PointerHandlers {
  const sensitivity = options?.sensitivity ?? 0.004;
  const disabled = options?.disabled ?? false;
  const onCommit = options?.onCommit;
  const dragging = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const valueRef = useRef(value);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - lastPoint.current.x;
      const dy = lastPoint.current.y - event.clientY;
      lastPoint.current = { x: event.clientX, y: event.clientY };
      const delta = (Math.abs(dx) > Math.abs(dy) ? dx : dy) * sensitivity;
      const next = Math.min(1, Math.max(0, valueRef.current + delta));
      valueRef.current = next;
      onChange(next);
    },
    [onChange, sensitivity]
  );

  const endDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    onCommitRef.current?.(valueRef.current);
  }, [onPointerMove]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;
      event.preventDefault();
      dragging.current = true;
      lastPoint.current = { x: event.clientX, y: event.clientY };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
    },
    [disabled, endDrag, onPointerMove]
  );

  useEffect(
    () => () => {
      dragging.current = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    },
    [endDrag, onPointerMove]
  );

  return { onPointerDown };
}
