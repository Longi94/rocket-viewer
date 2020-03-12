import { AnimationClip, AnimationMixer, BooleanKeyframeTrack } from 'three';
import { ReplayScene } from '../replay-scene';
import { BoostPadData } from '../../model/replay/boost-pad-data';
import { BoostPad } from '../../model/boost-pad';
import { BoostPadActor } from '../actor/boost-pad';
import { MixerGroup } from './mixer-group';

export class BoostPadMixers {
  private mixers: BoostPadMixer[] = [];

  constructor(pads: BoostPad[], data: { [id: number]: BoostPadData }, rs: ReplayScene, maxTime: number) {
    for (const pad of pads) {
      if (data[pad.id] == undefined) {
        continue;
      }
      if (data[pad.id].times.length > 1) {
        this.mixers.push(new BoostPadMixer(pad, data[pad.id], rs.boostPads[pad.id], maxTime));
      }
    }
  }

  update(time: number) {
    for (const mixer of this.mixers) {
      mixer.update(time);
    }
  }

  dispose() {
    for (const mixer of this.mixers) {
      mixer.dispose();
    }
    this.mixers = [];
  }
}

export class BoostPadMixer {

  private group: MixerGroup;

  constructor(pad: BoostPad, data: BoostPadData, actor: BoostPadActor, maxTime: number) {
    const mixer = new AnimationMixer(actor.glow);
    const track = new BooleanKeyframeTrack('.visible', data.times, data.available);
    const clip = new AnimationClip(`boost_pad_${pad.id}_clip`, maxTime, [track]);
    mixer.clipAction(clip).play();
    this.group = new MixerGroup(mixer, clip, actor.glow);
  }

  update(time: number) {
    this.group.update(time);
  }

  dispose() {
    this.group.dispose();
    this.group = undefined;
  }
}
