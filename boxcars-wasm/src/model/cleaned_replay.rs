use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use boxcars::{HeaderProp, KeyFrame, TickMark};
use crate::model::frame_data::FrameData;

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
