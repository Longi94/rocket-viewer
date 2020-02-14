use boxcars::Replay;
use crate::models::{ReplayVersion, FrameData};
use crate::actor::BallType::*;

pub trait ActorHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame_data: &FrameData);
}

// BALL
enum BallType {
    Default,
    Basketball,
    Puck,
    Cube,
    Breakout
}

pub struct BallHandler {
    ball_type: BallType
}

impl ActorHandler for BallHandler {
    fn update(&self, replay: &Replay, version: &ReplayVersion, frame_data: &FrameData) {}
}

pub fn get_handler(object_name: &'static str) -> Option<Box<dyn ActorHandler>> {
    match object_name {
        "Archetypes.Ball.Ball_Default" => Some(Box::new(BallHandler {ball_type: Default})),
        "Archetypes.Ball.Ball_Basketball" => Some(Box::new(BallHandler {ball_type: Basketball})),
        "Archetypes.Ball.Ball_Puck" => Some(Box::new(BallHandler {ball_type: Puck})),
        "Archetypes.Ball.CubeBall" => Some(Box::new(BallHandler {ball_type: Cube})),
        "Archetypes.Ball.Ball_Breakout" => Some(Box::new(BallHandler {ball_type: Breakout})),
        _ => None
    }
}
