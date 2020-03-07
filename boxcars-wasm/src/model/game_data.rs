use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct GameData {
    pub over_time: Option<f32>,
    pub remaining_times: Vec<i32>,
    pub remaining_times_times: Vec<f32>,
}

impl GameData {
    pub fn new() -> Self {
        GameData {
            over_time: None,
            remaining_times: Vec::new(),
            remaining_times_times: Vec::new(),
        }
    }
}
