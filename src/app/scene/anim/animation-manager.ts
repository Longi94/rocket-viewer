import { FrameData } from '../../model/replay/frame-data';
import { ReplayScene } from '../replay-scene';
import { BallMixer } from './ball-mixer';
import { CarMixer } from './car-mixer';
import { BoostPadMixers } from './boost-pad-mixer';
import { BoostPad } from '../../model/boost-pad';
import { HudMixer } from './hud-mixer';

export class AnimationManager {
  ballMixer: BallMixer;
  playerMixers: CarMixer[] = [];
  boostPadMixers: BoostPadMixers;
  hudMixer: HudMixer;

  constructor(frameData: FrameData, replayScene: ReplayScene, boostPads: BoostPad[], debug = false) {
    const maxTime = frameData.real_times[frameData.real_times.length - 1];

    this.ballMixer = new BallMixer(frameData, replayScene, maxTime);
    this.boostPadMixers = new BoostPadMixers(boostPads, frameData.boost_pads, replayScene, maxTime);

    for (const playerData of Object.values(frameData.players)) {
      this.playerMixers.push(new CarMixer(playerData, replayScene, maxTime));
    }

    this.hudMixer = new HudMixer(replayScene, maxTime);
  }

  update(time: number) {
    this.ballMixer.update(time);
    this.hudMixer.update(time);
    for (const mixer of this.playerMixers) {
      mixer.update(time);
    }
    this.boostPadMixers.update(time);
  }

  reset() {
    this.ballMixer.dispose();
    this.ballMixer = undefined;
    this.boostPadMixers.dispose();
    this.boostPadMixers = undefined;
    this.hudMixer.dispose();
    this.hudMixer = undefined;
    for (const mixer of this.playerMixers) {
      mixer.dispose();
    }
    this.playerMixers = [];
  }
}
