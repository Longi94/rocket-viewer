use crate::models::{BallFrame, ReplayVersion, FrameData};
use boxcars::Replay;
use std::collections::HashMap;

pub struct FrameParser<'a> {
    pub replay: &'a Replay
}

impl<'a> FrameParser<'a> {
    pub fn parse(&self) -> Result<FrameData, &str> {
        let frames = match &self.replay.network_frames {
            None => return Ok(FrameData::with_capacity(0)),
            Some(frames) => frames
        };

        let count = frames.frames.len();
        if count == 0 {
            return Ok(FrameData::with_capacity(0));
        }

        let replay_version = ReplayVersion(
            self.replay.major_version,
            self.replay.minor_version,
            self.replay.net_version.unwrap_or(0)
        );

        let mut frame_data = FrameData::with_capacity(count);
        let mut actors: HashMap<u32, > = HashMap::new();

        for (i, frame) in frames.frames.iter().enumerate() {
            let ball_frame = BallFrame::new();
            frame_data.ball_frames.push(ball_frame);
        }

        Ok(frame_data)
    }
}

