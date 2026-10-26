import { pointerTilt } from './pointer-tilt';

const BOUNDS = { left: 100, top: 50, width: 800, height: 400 };

describe('pointerTilt', () => {
  it('should not tilt when the pointer is in the center', () => {
    expect(pointerTilt(500, 250, BOUNDS)).toEqual({ x: 400, y: 200, tiltX: 0, tiltY: 0 });
  });

  it('should tilt to the maximum when the pointer is in the top right corner', () => {
    expect(pointerTilt(900, 50, BOUNDS)).toEqual({ x: 800, y: 0, tiltX: 8, tiltY: 8 });
  });

  it('should tilt the other way when the pointer is in the bottom left corner', () => {
    expect(pointerTilt(100, 450, BOUNDS)).toEqual({ x: 0, y: 400, tiltX: -8, tiltY: -8 });
  });
});
