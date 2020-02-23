use std::collections::HashMap;
use boxcars::Attribute;

pub struct FrameState {
    pub real_time: f32,
    pub frame: usize,
    pub actors: HashMap<i32, HashMap<String, Attribute>>,
    pub actor_objects: HashMap<i32, String>,
}

impl FrameState {
    pub fn new() -> Self {
        FrameState {
            real_time: 0.0,
            frame: 0,
            actors: HashMap::new(),
            actor_objects: HashMap::new(),
        }
    }
}
