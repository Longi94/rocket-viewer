use serde::Serialize;
use crate::model::body_states::BodyStates;

#[derive(Serialize, Debug, PartialEq, Copy, Clone)]
pub enum BallType {
    Unknown,
    Default,
    Basketball,
    Puck,
    Cube,
    Breakout,
}

#[derive(Serialize, Debug)]
pub struct BallData {
    pub ball_type: BallType,
    pub body_states: BodyStates,
}

impl BallData {
    pub fn new() -> Self {
        BallData {
            ball_type: BallType::Unknown,
            body_states: BodyStates::new(),
        }
    }
}
