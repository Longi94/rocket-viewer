use boxcars::{Replay, UpdatedAttribute, Attribute};
use crate::models::{ReplayVersion, FrameData, BallType};

pub trait ActorHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize,
              frame_data: &mut FrameData, attribute: &UpdatedAttribute);
}

pub struct BallHandler {
    ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize,
              frame_data: &mut FrameData, attribute: &UpdatedAttribute) {
        if frame_data.ball_data.ball_type == BallType::Unknown {
            frame_data.ball_data.ball_type = self.ball_type;
        }

        let object_name = match replay.objects.get(attribute.object_id.0 as usize) {
            None => return,
            Some(object_name) => object_name
        };

        match object_name.as_str() {
            "TAGame.RBActor_TA:ReplicatedRBState" => {
                match &attribute.attribute {
                    Attribute::RigidBody(rigid_body) => {
                        frame_data.ball_data.positions[frame].x = rigid_body.location.x;
                        frame_data.ball_data.positions[frame].y = rigid_body.location.y;
                        frame_data.ball_data.positions[frame].z = rigid_body.location.z;
                        frame_data.ball_data.rotation[frame].x = rigid_body.rotation.x;
                        frame_data.ball_data.rotation[frame].y = rigid_body.rotation.y;
                        frame_data.ball_data.rotation[frame].z = rigid_body.rotation.z;
                        frame_data.ball_data.rotation[frame].w = rigid_body.rotation.w;
                    }
                    _ => return
                }
            }
            _ => return
        }
    }
}

pub fn get_handler(object_name: &str) -> Option<Box<dyn ActorHandler>> {
    match object_name {
        "Archetypes.Ball.Ball_Default" => Some(Box::new(BallHandler {ball_type: BallType::Default})),
        "Archetypes.Ball.Ball_Basketball" => Some(Box::new(BallHandler {ball_type: BallType::Basketball})),
        "Archetypes.Ball.Ball_BasketBall" => Some(Box::new(BallHandler {ball_type: BallType::Basketball})),
        "Archetypes.Ball.Ball_Puck" => Some(Box::new(BallHandler {ball_type: BallType::Puck})),
        "Archetypes.Ball.CubeBall" => Some(Box::new(BallHandler {ball_type: BallType::Cube})),
        "Archetypes.Ball.Ball_Breakout" => Some(Box::new(BallHandler {ball_type: BallType::Breakout})),
        _ => None
    }
}
