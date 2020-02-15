import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { AnimationMixer } from 'three';
import { createBallAnimationMixer } from './ball';
import { createCarAnimationMixer } from './car';

export class AnimationManager {
  ballMixer: AnimationMixer;
  playerMixers: AnimationMixer[] = [];

  constructor(realFrameTimes: number[], frameData: FrameData, replayScene: ReplayScene) {
    this.ballMixer = createBallAnimationMixer(realFrameTimes, frameData, replayScene);

    for (const playerData of Object.values(frameData.players)) {
      this.playerMixers.push(createCarAnimationMixer(realFrameTimes, playerData, replayScene));
    }
  }

  update(time: number) {
    this.ballMixer.setTime(time);
    for (const mixer of this.playerMixers) {
      mixer.setTime(time);
    }
  }
}
