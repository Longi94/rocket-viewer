use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct JumpData {
    #[serde(skip_serializing)]
    pub jump_active: Vec<(f32, u8)>,
    #[serde(skip_serializing)]
    pub double_jump_active: Vec<(f32, u8)>,
    #[serde(skip_serializing)]
    pub dodge_active: Vec<(f32, u8)>,

    pub jump_visible: Vec<bool>,
    pub jump_times: Vec<f32>,
}

impl JumpData {
    pub fn new() -> Self {
        JumpData {
            jump_active: Vec::new(),
            double_jump_active: Vec::new(),
            dodge_active: Vec::new(),
            jump_visible: vec![false],
            jump_times: vec![0.0],
        }
    }
}
