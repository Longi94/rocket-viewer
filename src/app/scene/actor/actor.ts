import { Scene, Vector3 } from 'three';

export interface Actor {
  update(time: number);

  getPosition(): Vector3;

  addToScene(scene: Scene);
}
