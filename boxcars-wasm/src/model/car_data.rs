use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct CarData {
    pub steer_values: Vec<f32>,
    pub steer_times: Vec<f32>,
}

impl CarData {
    pub fn new() -> Self {
        CarData {
            steer_values: Vec::new(),
            steer_times: Vec::new(),
        }
    }
}
