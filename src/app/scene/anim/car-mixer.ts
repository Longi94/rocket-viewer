import { PlayerData } from '../../model/replay/player-data';
import {
  AnimationClip,
  AnimationMixer,
  AnimationObjectGroup,
  BooleanKeyframeTrack,
  NumberKeyframeTrack,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack
} from 'three';
import { ReplayScene } from '../replay-scene';
import { PlayerActor } from '../actor/player';
import { MixerGroup } from './mixer-group';

export class CarMixer {
  positionGroup: MixerGroup;
  rotationGroup: MixerGroup;
  jumpGroup: MixerGroup;
  wheelTurnGroup: MixerGroup;
  demoSpriteGroup?: MixerGroup;
  demoTextureGroup?: MixerGroup;

  constructor(playerData: PlayerData, rs: ReplayScene, maxTime: number) {
    const player = rs.players[playerData.id];

    this.createPositionMixer(playerData, player, maxTime);
    this.createRotationMixer(playerData, player, maxTime);
    this.createJumpMixer(playerData, player, maxTime);
    this.createWheelTurnMixer(playerData, player, maxTime);
    this.createDemoSpriteMixer(playerData, player, maxTime);
    this.createDemoSpriteTimeMixer(playerData, player, maxTime);
  }

  update(time: number) {
    this.positionGroup.update(time);
    this.rotationGroup.update(time);
    this.jumpGroup.update(time);
    this.wheelTurnGroup.update(time);
    this.demoSpriteGroup?.update(time);
    this.demoTextureGroup?.update(time);
  }

  dispose() {
    this.positionGroup.dispose();
    this.positionGroup = undefined;
    this.rotationGroup.dispose();
    this.rotationGroup = undefined;
    this.jumpGroup.dispose();
    this.jumpGroup = undefined;
    try {
      // TODO this fails on object groups for some reason
      this.wheelTurnGroup.dispose();
    } catch (e) {
    }
    this.wheelTurnGroup = undefined;
    this.demoSpriteGroup?.dispose();
    this.demoSpriteGroup = undefined;
    this.demoTextureGroup?.dispose();
    this.demoTextureGroup = undefined;
  }

  createPositionMixer(playerData: PlayerData, player: PlayerActor, maxTime: number) {
    const states = playerData.body_states;
    const mixer = new AnimationMixer(player.body);
    const positionTrack = new VectorKeyframeTrack('.position', states.times, states.positions);
    const visibleTrack = new BooleanKeyframeTrack('.visible', states.visible_times, states.visible);
    const clip = new AnimationClip(`car_position_${playerData.id}_clip`, maxTime, [positionTrack, visibleTrack]);
    mixer.clipAction(clip).play();
    this.positionGroup = new MixerGroup(mixer, clip, player.body);
  }

  createRotationMixer(playerData: PlayerData, player: PlayerActor, maxTime: number) {
    const states = playerData.body_states;
    const mixer = new AnimationMixer(player.car);
    const track = new QuaternionKeyframeTrack('.quaternion', states.times, states.rotations);
    const clip = new AnimationClip(`car_rotation_${playerData.id}_clip`, maxTime, [track]);
    mixer.clipAction(clip).play();
    this.rotationGroup = new MixerGroup(mixer, clip, player.car);
  }

  createJumpMixer(playerData: PlayerData, player: PlayerActor, maxTime: number) {
    const mixer = new AnimationMixer(player.jumpSprite);
    const jumpData = playerData.jump_data;
    const track = new BooleanKeyframeTrack('.visible', jumpData.jump_times, jumpData.jump_visible);
    const clip = new AnimationClip(`car_jump_${playerData.id}_clip`, maxTime, [track]);
    mixer.clipAction(clip).play();
    this.jumpGroup = new MixerGroup(mixer, clip, player.jumpSprite);
  }

  createWheelTurnMixer(playerData: PlayerData, player: PlayerActor, maxTime: number) {
    const data = playerData.car_data;
    const group = new AnimationObjectGroup();

    for (const bone of player.bodyModel.frontPivots) {
      group.add(bone);
    }

    // @ts-ignore
    const mixer = new AnimationMixer(group);
    const track = new QuaternionKeyframeTrack('.quaternion', data.steer_times, data.steer_values);
    const clip = new AnimationClip(`car_wheel_turn_${playerData.id}_clip`, maxTime, [track]);
    mixer.clipAction(clip).play();
    this.wheelTurnGroup = new MixerGroup(mixer, clip, group);
  }

  createDemoSpriteMixer(playerData: PlayerData, player: PlayerActor, maxTime: number) {
    if (playerData.demolished.length <= 1) {
      return undefined;
    }
    const mixer = new AnimationMixer(player.demoSprite);
    const positionTrack = new VectorKeyframeTrack('.position', playerData.demolished_times, playerData.demo_pos);
    const visibleTrack = new BooleanKeyframeTrack('.visible', playerData.demolished_times, playerData.demolished);
    const clip = new AnimationClip(`car_demo_${playerData.id}_clip`, maxTime, [positionTrack, visibleTrack]);
    mixer.clipAction(clip).play();
    this.demoSpriteGroup = new MixerGroup(mixer, clip, player.demoSprite);
  }

  createDemoSpriteTimeMixer(playerData: PlayerData, player: PlayerActor, maxTime: number) {
    if (playerData.demolished.length <= 1) {
      return undefined;
    }
    // @ts-ignore
    const mixer = new AnimationMixer(player.demoTexture);
    const track = new NumberKeyframeTrack('.time', playerData.demolished_times, playerData.demolished.map(v => v ? 0 : 1));
    const clip = new AnimationClip(`car_demo_time_${playerData.id}_clip`, maxTime, [track]);
    mixer.clipAction(clip).play();
    this.demoTextureGroup = new MixerGroup(mixer, clip, player.demoTexture);
  }
}
