import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { PromiseLoader } from 'rl-loadout-lib';
import { LinearEncoding, Texture } from 'three';
import { applyEnvMap, setEncoding } from '../../util/three';
import { traverseMaterials } from 'rl-loadout-lib/dist/3d/object';

export class ModelLoader {

  envMap: Texture;

  constructor(private readonly loader: PromiseLoader) {
  }

  async load(url: string): Promise<GLTF> {
    const gltf: GLTF = await this.loader.load(url);
    applyEnvMap(gltf.scene, this.envMap);
    setEncoding(gltf.scene, LinearEncoding);
    return gltf;
  }
}
