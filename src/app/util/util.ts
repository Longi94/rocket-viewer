import * as ColorHash from 'color-hash';

export const ColorHasher = new ColorHash({saturation: 1});

export function advanceFrame(currentFrame: number, currentTime: number, time: number, frameTimes: number[]) {
  if (time > currentTime) {
    while (frameTimes[currentFrame + 1] < time) {
      currentFrame++;
    }
  } else {
    while (frameTimes[currentFrame] > time) {
      currentFrame--;
    }
  }
  return currentFrame;
}
