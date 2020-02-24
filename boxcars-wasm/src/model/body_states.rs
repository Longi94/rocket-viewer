use serde::Serialize;
use crate::model::vector::Vector3;
use boxcars::Attribute;

#[derive(Serialize, Debug)]
pub struct BodyStates {
    pub positions: Vec<f32>,
    pub times: Vec<f32>,
    pub rotations: Vec<f32>,
    #[serde(skip_serializing)]
    pub linear_velocity: Vec<Vector3>,
    pub visible: Vec<bool>,
    pub visible_times: Vec<f32>,
}

impl BodyStates {
    pub fn new() -> BodyStates {
        BodyStates {
            positions: Vec::new(),
            times: Vec::new(),
            rotations: Vec::new(),
            linear_velocity: Vec::new(),
            visible: vec![true],
            visible_times: vec![0.0],
        }
    }

    pub fn push(&mut self, time: f32, attr: &Attribute) {
        match attr {
            Attribute::RigidBody(rigid_body) => {
                let current_len = self.times.len();
                if current_len > 0 &&
                    self.positions[(current_len - 1) * 3] == rigid_body.location.x &&
                    self.positions[(current_len - 1) * 3 + 1] == rigid_body.location.z &&
                    self.positions[(current_len - 1) * 3 + 2] == rigid_body.location.y &&
                    self.rotations[(current_len - 1) * 4] == -rigid_body.rotation.x &&
                    self.rotations[(current_len - 1) * 4 + 1] == -rigid_body.rotation.z &&
                    self.rotations[(current_len - 1) * 4 + 2] == -rigid_body.rotation.y &&
                    self.rotations[(current_len - 1) * 4 + 3] == rigid_body.rotation.w {
                    // ignore dupes, if this is legit it will be caught by the cleaner
                    return;
                }

                // convert vectors from Z-up to Y-up coordinate system
                self.positions.push(rigid_body.location.x);
                self.positions.push(rigid_body.location.z);
                self.positions.push(rigid_body.location.y);

                // convert quaternions from Z-up to Y-up coordinate system
                self.rotations.push(-rigid_body.rotation.x);
                self.rotations.push(-rigid_body.rotation.z);
                self.rotations.push(-rigid_body.rotation.y);
                self.rotations.push(rigid_body.rotation.w);

                self.times.push(time);
                self.linear_velocity.push(rigid_body.linear_velocity
                    .and_then(Vector3::from_vector3f)
                    .unwrap_or(Vector3 { x: 0.0, y: 0.0, z: 0.0 }));

                if !self.visible.last().unwrap_or(&true).clone() {
                    self.visible.push(true);
                    self.visible_times.push(time);
                }
            }
            _ => return
        }
    }
}
