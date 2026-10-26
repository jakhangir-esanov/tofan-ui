export interface PointerTilt {
  readonly x: number;
  readonly y: number;
  readonly tiltX: number;
  readonly tiltY: number;
}

export const RESTING_TILT: PointerTilt = { x: 0, y: 0, tiltX: 0, tiltY: 0 };

const MAX_TILT_DEGREES = 8;

export function pointerTilt(
  clientX: number,
  clientY: number,
  bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
): PointerTilt {
  const x = clientX - bounds.left;
  const y = clientY - bounds.top;
  const offsetRight = x / bounds.width - 0.5;
  const offsetUp = 0.5 - y / bounds.height;
  return {
    x,
    y,
    tiltX: round(offsetRight * 2 * MAX_TILT_DEGREES),
    tiltY: round(offsetUp * 2 * MAX_TILT_DEGREES),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
