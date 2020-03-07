import { ReplayScene } from '../replay-scene';
import { AnimationClip, AnimationMixer, InterpolateDiscrete, KeyframeTrack, LoopOnce, NumberKeyframeTrack } from 'three';

export function createHudMixer(rs: ReplayScene, maxTime): AnimationMixer {
  const mixer = new AnimationMixer(rs.hudData);
  const clip = new AnimationClip('hud_clip', maxTime, [
    createClockTrack(rs),
    createTeamScoreTrack(rs, 0),
    createTeamScoreTrack(rs, 1)
  ]);
  mixer.clipAction(clip).play().loop = LoopOnce;
  return mixer;
}

function createClockTrack(rs: ReplayScene): KeyframeTrack {
  const data = rs.replay.frame_data.game_data;
  return new NumberKeyframeTrack('.remainingSeconds', data.remaining_times_times, data.remaining_times, InterpolateDiscrete);
}

function createTeamScoreTrack(rs: ReplayScene, team: number): KeyframeTrack {
  const data = team === 1 ? rs.replay.frame_data.team_1_data : rs.replay.frame_data.team_0_data;
  const property = team === 1 ? '.scoreOrange' : '.scoreBlue';
  return new NumberKeyframeTrack(property, data.score_times, data.scores, InterpolateDiscrete);
}
