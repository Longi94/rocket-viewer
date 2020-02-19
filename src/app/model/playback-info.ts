import { PlayerData } from './replay/player-data';
import { CameraType } from '../scene/camera/camera-type';

export class PlaybackInfo {
  minTime: number;
  maxTime: number;
  players: PlayerPlaybackInfo[];
}

export class PlayerPlaybackInfo {
  name: string;
  id: number;

  static from(data: PlayerData): PlayerPlaybackInfo {
    return {
      name: data.name,
      id: data.id
    };
  }
}

export class PlaybackCameraChange {
  type: CameraType;
  targetPlayer?: number;
}
