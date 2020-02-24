import { Emitter, SpriteRenderer, System } from 'three-nebula';
import { Scene, WebGLRenderer } from 'three';
import * as THREE from 'three';

export class ParticleSystemManager {
  private readonly system = new System();

  private currentTime: number;

  constructor(private readonly renderer: WebGLRenderer, scene: Scene) {
    this.system.addRenderer(new SpriteRenderer(scene, THREE));
  }

  update(time: number) {
    const d = time - this.currentTime;
    this.system.update(d);
    this.currentTime = time;
  }

  createEmitter(): Emitter {
    const emitter = new Emitter();
    this.system.addEmitter(emitter);
    return emitter;
  }
}
