use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use boxcars::{HeaderProp, KeyFrame, TickMark, Vector3f};
use wasm_bindgen::__rt::std::collections::HashMap;

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

    pub fn subtract(&mut self, a: &Vector3, b: &Vector3) {
        self.x = a.x - b.x;
        self.y = a.y - b.y;
        self.z = a.z - b.z;
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

#[derive(Serialize, Debug)]
pub struct CleanedReplay {
    pub major_version: i32,
    pub minor_version: i32,
    pub net_version: Option<i32>,
    pub game_type: String,

    #[serde(serialize_with = "pair_vec")]
    pub properties: Vec<(String, HeaderProp)>,
    pub keyframes: Vec<KeyFrame>,
    pub tick_marks: Vec<TickMark>,
    pub frame_data: FrameData,
}

#[derive(Serialize, Debug)]
pub struct FrameData {
    pub ball_data: BallData,
    pub times: Vec<f32>,
    pub deltas: Vec<f32>,
    pub players: HashMap<i32, PlayerData>,
}

impl FrameData {
    pub fn with_capacity(c: usize) -> Self {
        FrameData {
            ball_data: BallData::new(),
            times: Vec::with_capacity(c),
            deltas: Vec::with_capacity(c),
            players: HashMap::new(),
        }
    }
}

// BALL
#[derive(Serialize, Debug, PartialEq, Copy, Clone)]
pub enum BallType {
    Unknown,
    Default,
    Basketball,
    Puck,
    Cube,
    Breakout,
}

#[derive(Serialize, Debug)]
pub struct BallData {
    pub ball_type: BallType,
    pub positions: Vec<f32>,
    pub position_times: Vec<f32>,
    pub rotations: Vec<f32>,
    pub linear_velocity: Vec<Vector3>,
}

impl BallData {
    pub fn new() -> Self {
        BallData {
            ball_type: BallType::Unknown,
            positions: Vec::new(),
            position_times: Vec::new(),
            rotations: Vec::new(),
            linear_velocity: Vec::new(),
        }
    }
}

#[derive(Serialize, Debug)]
pub struct PlayerData {
    pub id: i32,
    pub name: Option<String>,
    pub team: Option<u32>,
    pub positions: Vec<f32>,
    pub position_times: Vec<f32>,
    pub rotations: Vec<f32>,
    pub visible: Vec<bool>,
    pub linear_velocity: Vec<Vector3>,
}

impl PlayerData {
    pub fn new() -> Self {
        PlayerData {
            id: -1,
            name: None,
            team: None,
            positions: Vec::new(),
            position_times: Vec::new(),
            rotations: Vec::new(),
            visible: Vec::new(),
            linear_velocity: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct ReplayVersion(pub i32, pub i32, pub i32);

fn pair_vec<K, V, S>(inp: &[(K, V)], serializer: S) -> Result<S::Ok, S::Error>
    where
        K: Serialize,
        V: Serialize,
        S: Serializer,
{
    let mut state = serializer.serialize_map(Some(inp.len()))?;
    for &(ref key, ref val) in inp.iter() {
        state.serialize_key(key)?;
        state.serialize_value(val)?;
    }
    state.end()
}
