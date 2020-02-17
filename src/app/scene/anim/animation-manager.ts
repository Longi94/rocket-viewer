import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { AnimationMixer } from 'three';
import { createBallAnimationMixer } from './ball';
import { createCarAnimationMixer } from './car';

export class AnimationManager {
  ballMixer: AnimationMixer;
  playerMixers: AnimationMixer[] = [];

  constructor(realFrameTimes: number[], frameData: FrameData, replayScene: ReplayScene, debug = false) {
    this.ballMixer = createBallAnimationMixer(realFrameTimes, frameData, replayScene, debug);

    for (const playerData of Object.values(frameData.players)) {
      this.playerMixers.push(createCarAnimationMixer(realFrameTimes, playerData, replayScene, debug));
    }
  }

  update(time: number) {
    this.ballMixer.setTime(time);
    for (const mixer of this.playerMixers) {
      mixer.setTime(time);
    }
  }
}
