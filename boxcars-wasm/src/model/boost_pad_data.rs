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
}
