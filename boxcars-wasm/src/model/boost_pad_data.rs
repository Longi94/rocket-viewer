use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct BoostPadData {
    pub available: Vec<bool>,
    pub times: Vec<f32>,
}

impl BoostPadData {
    pub fn new() -> Self {
        BoostPadData {
            available: vec![true],
            times: vec![0.0],
        }
    }

    pub fn reset(&mut self, time: f32) {
        let last = self.times.len() - 1;
        if self.available[last] && self.times[last] > time {
            self.times[last] = time;
        }
    }
}
