use crate::models::{BallFrame, ReplayVersion, FrameData};
use boxcars::{Replay, ActorId};
use std::collections::HashMap;
use crate::actor::{ActorHandler, get_handler};

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
            self.replay.net_version.unwrap_or(0),
        );

        let mut frame_data = FrameData::with_capacity(count);
        let mut actors: HashMap<ActorId, dyn ActorHandler> = HashMap::new();

        for (i, frame) in frames.frames.iter().enumerate() {
            let ball_frame = BallFrame::new();
            frame_data.ball_frames.push(ball_frame);

            for deleted in frame.deleted_actors {
                actors.remove(&deleted);
            }

            for created in frame.new_actors {
                let object_name = match &self.replay.objects.get(created.object_id.0 as usize) {
                    None => continue,
                    Some(&object_name) => object_name
                };

                let handler = match get_handler(object_name.as_str()) {
                    None => continue,
                    Some(b) => b
                };
            }
        }

        Ok(frame_data)
    }
}

