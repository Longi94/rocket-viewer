/* tslint:disable:variable-name */

import { Keyframe } from './keyframe';
import { TickMark } from './tick-mark';
import { FrameData } from './frame-data';

export interface Replay {
  major_version: number;
  minor_version: number;
  net_version: number;
  game_type: string;
  properties: { [name: string]: any };
  keyframes: Keyframe[];
  tickMarks: TickMark[];
  frame_data: FrameData;
}
