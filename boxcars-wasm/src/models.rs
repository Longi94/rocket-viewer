use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use boxcars::{HeaderProp, KeyFrame, TickMark, Vector3f, Quaternion};

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
}

impl FrameData {
    pub fn with_capacity(c: usize) -> Self {
        FrameData {
            ball_data: BallData::with_capacity(c),
            times: Vec::with_capacity(c),
            deltas: Vec::with_capacity(c),
        }
    }

    pub fn create_frame(&mut self, frame: usize) {
        self.ball_data.create_frame(frame);
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
    pub positions: Vec<Vector3f>,
    pub rotations: Vec<Quaternion>,
}

impl BallData {
    pub fn with_capacity(c: usize) -> Self {
        BallData {
            ball_type: BallType::Unknown,
            positions: Vec::with_capacity(c),
            rotations: Vec::with_capacity(c),
        }
    }

    pub fn create_frame(&mut self, frame: usize) {
        if frame > 0 {
            self.positions.push(self.positions[frame - 1].clone());
            self.rotations.push(self.rotations[frame - 1].clone());
        } else {
            self.positions.push(Vector3f { x: 0.0, y: 0.0, z: 0.0 });
            self.rotations.push(Quaternion { x: 0.0, y: 0.0, z: 0.0, w: 0.0 });
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
