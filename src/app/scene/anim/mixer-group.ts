import { AnimationClip, AnimationMixer } from 'three';

export class MixerGroup {
  mixer: AnimationMixer;
  clip: AnimationClip;
  root: any;

  constructor(mixer: AnimationMixer, clip: AnimationClip, root: any) {
    this.mixer = mixer;
    this.clip = clip;
    this.root = root;
  }

  update(time: number) {
    this.mixer.setTime(time);
  }

  dispose() {
    this.mixer.uncacheAction(this.clip, this.root);
    this.mixer.uncacheClip(this.clip);
    this.mixer.uncacheRoot(this.root);

    this.mixer = undefined;
    this.root = undefined;
    this.clip = undefined;
  }
}
