use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct JumpData {
    pub jump_active: Vec<(usize, u8)>,
    pub double_jump_active: Vec<(usize, u8)>,
    pub dodge_active: Vec<(usize, u8)>,
}

impl JumpData {
    pub fn new() -> Self {
        JumpData {
            jump_active: Vec::new(),
            double_jump_active: Vec::new(),
            dodge_active: Vec::new(),
        }
    }
}
