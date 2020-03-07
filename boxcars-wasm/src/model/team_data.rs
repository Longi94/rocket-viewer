use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct TeamData {
    pub scores: Vec<i32>,
    pub score_times: Vec<f32>,
}

impl TeamData {
    pub fn new() -> Self {
        TeamData {
            scores: vec![0],
            score_times: vec![0.0],
        }
    }
}
