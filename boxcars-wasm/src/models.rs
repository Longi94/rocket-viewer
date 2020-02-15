use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use boxcars::{HeaderProp, KeyFrame, TickMark};
use wasm_bindgen::__rt::std::collections::HashMap;

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
            ball_data: BallData::with_capacity(c),
            times: Vec::with_capacity(c),
            deltas: Vec::with_capacity(c),
            players: HashMap::new(),
        }
    }

    pub fn create_frame(&mut self, frame: usize) {
        self.ball_data.create_frame(frame);
        for (_, player_data) in &mut self.players {
            player_data.create_frame(frame);
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
    pub rotations: Vec<f32>,
}

impl BallData {
    pub fn with_capacity(c: usize) -> Self {
        BallData {
            ball_type: BallType::Unknown,
            positions: Vec::with_capacity(c * 3),
            rotations: Vec::with_capacity(c * 4),
        }
    }

    fn push_default(&mut self) {
        for _i in 0..3 {
            self.positions.push(0.0);
            self.rotations.push(0.0);
        }
        self.rotations.push(0.0);
    }

    pub fn create_frame(&mut self, frame: usize) {
        while frame > self.positions.len() * 3 {
            self.push_default();
        }

        if frame > 0 {
            for i in 0..3 {
                self.positions.push(self.positions[(frame - 1) * 3 + i]);
                self.rotations.push(self.rotations[(frame - 1) * 4 + i]);
            }
            self.rotations.push(self.rotations[(frame - 1) * 4 + 3]);
        } else {
            self.push_default();
        }
    }
}

#[derive(Serialize, Debug)]
pub struct PlayerData {
    pub name: Option<String>,
    pub team: Option<u32>,
    pub positions: Vec<f32>,
    pub rotations: Vec<f32>,
    pub visible: Vec<bool>,
}

impl PlayerData {
    pub fn with_capacity(c: usize) -> Self {
        PlayerData {
            name: None,
            team: None,
            positions: Vec::with_capacity(c * 3),
            rotations: Vec::with_capacity(c * 4),
            visible: Vec::with_capacity(c),
        }
    }

    fn push_default(&mut self) {
        self.visible.push(false);
        for _i in 0..3 {
            self.positions.push(0.0);
            self.rotations.push(0.0);
        }
        self.rotations.push(0.0);
    }

    pub fn create_frame(&mut self, frame: usize) {
        while frame > self.visible.len() {
            self.push_default();
        }

        if frame > 0 {
            self.visible.push(self.visible[frame - 1]);
            for i in 0..3 {
                self.positions.push(self.positions[(frame - 1) * 3 + i]);
                self.rotations.push(self.rotations[(frame - 1) * 4 + i]);
            }
            self.rotations.push(self.rotations[(frame - 1) * 4 + 3]);
        } else {
            self.push_default();
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
