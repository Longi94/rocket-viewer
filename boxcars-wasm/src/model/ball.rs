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
    pub hit_team: Vec<u8>,
    pub hit_team_times: Vec<f32>,
}

impl BallData {
    pub fn new() -> Self {
        BallData {
            ball_type: BallType::Unknown,
            body_states: BodyStates::new(),
            hit_team: vec![2],
            hit_team_times: vec![0.0],
        }
    }

    pub fn reset(&mut self, time: f32) {
        self.hit_team.push(2);
        self.hit_team_times.push(time);
    }
}
