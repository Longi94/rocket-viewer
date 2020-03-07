import { AnimationClip, AnimationMixer, BooleanKeyframeTrack, LoopOnce } from 'three';
import { ReplayScene } from '../replay-scene';
import { BoostPadData } from '../../model/replay/boost-pad-data';
import { BoostPad } from '../../model/boost-pad';

export function createBoostPadAnimations(pads: BoostPad[], data: { [id: number]: BoostPadData }, rs: ReplayScene,
                                         maxTime: number): AnimationMixer[] {
  const mixers: AnimationMixer[] = [];
  for (const pad of pads) {
    if (data[pad.id] == undefined) {
      continue;
    }
    if (data[pad.id].times.length > 1) {
      const mixer = new AnimationMixer(rs.boostPads[pad.id].glow);
      const track = new BooleanKeyframeTrack('.visible', data[pad.id].times, data[pad.id].available);
      const clip = new AnimationClip(`boost_pad_${pad.id}_clip`, maxTime, [track]);
      mixer.clipAction(clip).play().loop = LoopOnce;
      mixers.push(mixer);
    }
  }
  return mixers;
}
