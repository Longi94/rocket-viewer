use boxcars::{Replay, UpdatedAttribute, Attribute};
use crate::models::{ReplayVersion, FrameData, BallType};
use wasm_bindgen::__rt::std::collections::HashMap;

pub trait ActorHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize,
              frame_data: &mut FrameData, attributes: &HashMap<String, Attribute>);
}

pub struct BallHandler {
    ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize,
              frame_data: &mut FrameData, attributes: &HashMap<String, Attribute>) {
        if frame_data.ball_data.ball_type == BallType::Unknown {
            frame_data.ball_data.ball_type = self.ball_type;
        }

        match attributes.get("TAGame.RBActor_TA:ReplicatedRBState") {
            Some(rigid_body) => match rigid_body {
                Attribute::RigidBody(rigid_body) => {
                    frame_data.ball_data.positions[frame * 3] = rigid_body.location.x;
                    // Y is up in three.js
                    frame_data.ball_data.positions[frame * 3 + 1] = rigid_body.location.z;
                    frame_data.ball_data.positions[frame * 3 + 2] = rigid_body.location.y;
                    frame_data.ball_data.rotations[frame * 4] = rigid_body.rotation.x;
                    frame_data.ball_data.rotations[frame * 4 + 1] = rigid_body.rotation.y;
                    frame_data.ball_data.rotations[frame * 4 + 2] = rigid_body.rotation.z;
                    frame_data.ball_data.rotations[frame * 4 + 3] = rigid_body.rotation.w;
                }
                _ => return
            }
            _ => return
        }
    }
}

pub struct CarHandler {
}

impl ActorHandler for CarHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: usize,
              frame_data: &mut FrameData, attributes: &HashMap<String, Attribute>) {
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
