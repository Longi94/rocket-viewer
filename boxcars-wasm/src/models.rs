use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use boxcars::{HeaderProp, KeyFrame, TickMark, Vector3f, Attribute};
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

#[derive(Serialize, Debug)]
pub struct BodyStates {
    pub positions: Vec<f32>,
    pub times: Vec<f32>,
    pub rotations: Vec<f32>,
    pub linear_velocity: Vec<Vector3>,
}

impl BodyStates {
    fn new() -> BodyStates {
        BodyStates {
            positions: Vec::new(),
            times: Vec::new(),
            rotations: Vec::new(),
            linear_velocity: Vec::new(),
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
            }
            _ => return
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
    pub body_states: BodyStates,
}

impl BallData {
    pub fn new() -> Self {
        BallData {
            ball_type: BallType::Unknown,
            body_states: BodyStates::new(),
        }
    }
}

#[derive(Serialize, Debug)]
pub struct PlayerLoadout {
    pub body: u32,
    pub decal: u32,
    pub wheels: u32,
    pub boost: u32,
    pub antenna: u32,
    pub topper: u32,
    pub engine_audio: u32,
    pub trail: u32,
    pub goal_explosion: u32,
    pub banner: u32,
}

impl PlayerLoadout {
    pub fn new() -> Self {
        PlayerLoadout {
            body: 0,
            decal: 0,
            wheels: 0,
            boost: 0,
            antenna: 0,
            topper: 0,
            engine_audio: 0,
            trail: 0,
            goal_explosion: 0,
            banner: 0,
        }
    }
}

#[derive(Serialize, Debug)]
pub struct PlayerLoadouts {
    pub blue: PlayerLoadout,
    pub orange: Option<PlayerLoadout>,
}

impl PlayerLoadouts {
    fn new() -> Self {
        PlayerLoadouts {
            blue: PlayerLoadout::new(),
            orange: None,
        }
    }
}

#[derive(Serialize, Debug)]
pub struct PlayerData {
    pub id: i32,
    pub name: Option<String>,
    pub team: Option<u32>,
    pub loadouts: PlayerLoadouts,
    pub body_states: BodyStates,
    pub visible: Vec<bool>,
}

impl PlayerData {
    pub fn new(id: i32) -> Self {
        PlayerData {
            id,
            name: None,
            team: None,
            body_states: BodyStates::new(),
            loadouts: PlayerLoadouts::new(),
            visible: Vec::new(),
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
