use serde::Serialize;

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
