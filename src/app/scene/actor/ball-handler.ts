import { ActorHandler, HandlerCreator } from './actor-handler';
import { ReplayScene } from '../replay-scene';
import { ThreeSceneHandler } from './three-scene-handler';


export const BasketBallHandlerCreator: HandlerCreator = {
  create: (replayScene: ReplayScene): ActorHandler => {
    return new ThreeSceneHandler(replayScene);
  }
};
