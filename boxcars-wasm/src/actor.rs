use boxcars::Replay;
use crate::models::{ReplayVersion, FrameData, BallType};

pub trait ActorHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: i32, frame_data: &mut FrameData);
}

pub struct BallHandler {
    ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame: i32, frame_data: &mut FrameData) {
        if frame_data.ball_data.ball_type == BallType::Unknown {
            frame_data.ball_data.ball_type = self.ball_type;
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
