import { DefaultLoadingManager, TextureLoader } from 'three';
import { createPaintConfig, PromiseLoader, RocketAssetManager, RocketConfig, TextureFormat } from 'rl-loadout-lib';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


const dracoLoader = new DRACOLoader(DefaultLoadingManager);
dracoLoader.setDecoderPath('/assets/draco/');
const gltfLoader = new GLTFLoader(DefaultLoadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

export const modelLoader = new PromiseLoader(gltfLoader);
export const textureLoader = new PromiseLoader(new TextureLoader(DefaultLoadingManager));

const ROCKET_CONFIG = new RocketConfig({
  loadingManager: DefaultLoadingManager,
  textureFormat: TextureFormat.PNG,
  useCompressedModels: true,
  gltfLoader
});

export const RocketManager: RocketAssetManager = new RocketAssetManager(ROCKET_CONFIG);
export const DEFAULT_PAINT_CONFIG_BLUE = createPaintConfig();
export const DEFAULT_PAINT_CONFIG_ORANGE = createPaintConfig(true);
