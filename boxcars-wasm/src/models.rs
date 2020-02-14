use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use boxcars::{HeaderProp, KeyFrame, TickMark};

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
    pub frame_data: FrameData
}

#[derive(Serialize, Debug)]
pub struct FrameData {
    pub ball_frames: Vec<BallFrame>
}

impl FrameData {
    pub fn with_capacity(c: usize) -> Self {
        FrameData {
            ball_frames: Vec::with_capacity(c)
        }
    }
}

#[derive(Serialize, Debug)]
pub struct BallFrame {
    pub pos_x: f32,
    pub pos_y: f32,
    pub pos_z: f32,
    pub quat_x: f32,
    pub quat_y: f32,
    pub quat_z: f32,
    pub quat_w: f32,
}

impl BallFrame {
    pub fn new() -> Self {
        BallFrame {
            pos_x: 0.0,
            pos_y: 0.0,
            pos_z: 0.0,
            quat_x: 0.0,
            quat_y: 0.0,
            quat_z: 0.0,
            quat_w: 0.0,
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
