import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { AnimationMixer } from 'three';
import { createBallAnimationMixer } from './ball';
import { createCarAnimationMixer } from './car';
import { createBoostPadAnimations } from './boost-pad';
import { BoostPad } from '../../model/boost-pad';

export class AnimationManager {
  ballMixer: AnimationMixer;
  playerMixers: AnimationMixer[] = [];
  boostPadMixers: AnimationMixer[];

  constructor(frameData: FrameData, replayScene: ReplayScene, boostPads: BoostPad[], debug = false) {
    this.ballMixer = createBallAnimationMixer(frameData, replayScene, debug);
    this.boostPadMixers = createBoostPadAnimations(boostPads, frameData.boost_pads, replayScene);

    for (const playerData of Object.values(frameData.players)) {
      const mixers = createCarAnimationMixer(playerData, replayScene, debug);
      for (const mixer of mixers) {
        if (mixer != undefined) {
          this.playerMixers.push(mixer);
        }
      }
    }
  }

  update(time: number) {
    this.ballMixer.setTime(time);
    for (const mixer of this.playerMixers) {
      mixer.setTime(time);
    }
    for (const mixer of this.boostPadMixers) {
      mixer.setTime(time);
    }
  }
}
