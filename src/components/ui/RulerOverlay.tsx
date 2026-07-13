'use client';

import React, { RefObject } from 'react';
import { Point } from '@/lib/types';
import { midpoint, projectToContainer } from '@/lib/utils/rulerGeometry';
import { feetInchesLabel, inchesLabel } from '@/lib/utils/formatLength';

interface RulerOverlayProps {
  start: Point | null;
  end: Point | null;
  distance: number | null;
  zoom: number;
  containerRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}

const LINE_COLOR = '#2196f3';

/**
 * Pixel-space overlay for the ruler. Rendered as a sibling of the zoom
 * container so the label stays a fixed size; endpoints are projected from data
 * inches to container px on every render, keeping the line anchored across
 * pan/zoom.
 */
export const RulerOverlay: React.FC<RulerOverlayProps> = ({
  start,
  end,
  distance,
  zoom,
  containerRef,
  contentRef,
}) => {
  const container = containerRef.current;
  const content = contentRef.current;
  if (!start || !end || distance === null || !container || !content) {
    return null;
  }

  const containerRect = container.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();

  const a = projectToContainer(start, contentRect, containerRect, zoom);
  const b = projectToContainer(end, contentRect, containerRect, zoom);
  const mid = midpoint(a, b);

  return (
    <>
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={LINE_COLOR}
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <circle cx={a.x} cy={a.y} r={4} fill={LINE_COLOR} />
        <circle cx={b.x} cy={b.y} r={4} fill={LINE_COLOR} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: mid.x,
          top: mid.y,
          transform: 'translate(-50%, -50%)',
          padding: '2px 6px',
          borderRadius: 4,
          backgroundColor: LINE_COLOR,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {feetInchesLabel(distance)} ({inchesLabel(distance)})
      </div>
    </>
  );
};
