use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct BoostData {
    pub active: Vec<bool>,
    pub times: Vec<f32>,
}

impl BoostData {
    pub fn new() -> Self {
        BoostData {
            active: vec![false],
            times: vec![0.0],
        }
    }
}
