import { HandlerCreator } from './actor-handler';
import { BasketBallHandlerCreator } from './ball-handler';

export const HANDLER_MAPPING: { [objectName: string]: HandlerCreator } = {
  'Archetypes.Ball.Ball_Basketball': BasketBallHandlerCreator,
  'Archetypes.Ball.Ball_BasketBall': BasketBallHandlerCreator,
};
