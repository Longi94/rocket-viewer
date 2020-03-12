import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { AnimationMixer } from 'three';
import { createBallAnimationMixer } from './ball';
import { createCarAnimationMixer } from './car';
import { createBoostPadAnimations } from './boost-pad';
import { BoostPad } from '../../model/boost-pad';
import { createHudMixer } from './hud';

export class AnimationManager {
  ballMixer: AnimationMixer;
  playerMixers: AnimationMixer[] = [];
  boostPadMixers: AnimationMixer[];
  hudMixer: AnimationMixer;

  constructor(frameData: FrameData, replayScene: ReplayScene, boostPads: BoostPad[], debug = false) {
    const maxTime = frameData.real_times[frameData.real_times.length - 1];

    this.ballMixer = createBallAnimationMixer(frameData, replayScene, maxTime, debug);
    this.boostPadMixers = createBoostPadAnimations(boostPads, frameData.boost_pads, replayScene, maxTime);

    for (const playerData of Object.values(frameData.players)) {
      this.addMixers(createCarAnimationMixer(playerData, replayScene, maxTime, debug));
    }

    this.hudMixer = createHudMixer(replayScene, maxTime);
  }

  private addMixers(mixers: AnimationMixer[]) {
    for (const mixer of mixers) {
      if (mixer != undefined) {
        this.playerMixers.push(mixer);
      }
    }
  }

  update(time: number) {
    this.ballMixer.setTime(time);
    this.hudMixer.setTime(time);
    for (const mixer of this.playerMixers) {
      mixer.setTime(time);
    }
    for (const mixer of this.boostPadMixers) {
      mixer.setTime(time);
    }
  }

  reset() {

  }
}
