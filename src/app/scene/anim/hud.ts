import { ReplayScene } from '../replay-scene';
import { AnimationClip, AnimationMixer, InterpolateDiscrete, LoopOnce, NumberKeyframeTrack } from 'three';

export function createHudMixers(rs: ReplayScene) {
  return [createClockMixer(rs)];
}

function createClockMixer(rs: ReplayScene): AnimationMixer {
  const data = rs.replay.frame_data.game_data;
  const mixer = new AnimationMixer(rs.hudData);
  const track = new NumberKeyframeTrack('.remainingSeconds', data.remaining_times_times, data.remaining_times, InterpolateDiscrete);
  const clip = new AnimationClip(`clock_clip`, data.remaining_times_times[data.remaining_times_times.length - 1],
    [track]);
  mixer.clipAction(clip).play().loop = LoopOnce;
  return mixer;
}
