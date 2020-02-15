use crate::models::{ReplayVersion, FrameData};
use boxcars::{Replay};
use std::collections::HashMap;
use crate::actor::{get_handler, ActorHandler};

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
        let mut actors_handlers: HashMap<i32, Box<dyn ActorHandler>> = HashMap::new();

        for (i, frame) in frames.frames.iter().enumerate() {
            frame_data.create_frame();

            for deleted in &frame.deleted_actors {
                actors_handlers.remove(&deleted.0);
            }

            for new_actor in &frame.new_actors {
                let object_name = match self.replay.objects.get(new_actor.object_id.0 as usize) {
                    None => continue,
                    Some(object_name) => object_name
                };

                let handler = match get_handler(object_name) {
                    None => continue,
                    Some(handler) => handler
                };

                actors_handlers.insert(new_actor.actor_id.0, handler);
            }

            for updated_actor in &frame.updated_actors {
                match actors_handlers.get(&updated_actor.actor_id.0) {
                    None => continue,
                    Some(handler) => {
                        handler.update(&self.replay, &replay_version, i as i32, &mut frame_data);
                    }
                }
            }
        }

        Ok(frame_data)
    }
}
