use serde::Serialize;
use boxcars::Vector3f;

#[derive(Serialize, Debug)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Vector3 {
    pub fn from_vector3f(v: Vector3f) -> Option<Vector3> {
        Some(Vector3 {
            x: v.x,
            y: v.y,
            z: v.z,
        })
    }

    pub fn len(&self) -> f32 {
        return (self.x.powi(2) + self.y.powi(2) + self.z.powi(2)).sqrt();
    }

    pub fn dot(&self, other: &Vector3) -> f32 {
        return self.x * other.x + self.y * other.y + self.z * other.z;
    }

    pub fn cos_angle(&self, other: &Vector3) -> f32 {
        return self.dot(other) / (self.len() * other.len());
    }
}
