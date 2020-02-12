import { Frame } from './frame';
import { Keyframe } from './keyframe';
import { TickMark } from './tick-mark';
import { ClassIndex } from './class-index';
import { NetCache } from './net-cache';

export interface Replay {
  header_size: number;
  header_crc: number;
  major_version: number;
  minor_version: number;
  net_version: number;
  game_type: string;
  properties: { [name: string]: any };
  content_size: number;
  content_crc: number;
  network_frames: Frame[];
  levels: string[];
  keyframes: Keyframe[];
  debug_info: string[];
  tickMarks: TickMark[];
  packages: string[];
  objects: string[];
  name: string[];
  class_indices: ClassIndex[];
  net_cache: NetCache[];
}
