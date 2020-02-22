use boxcars::{Replay, Attribute};
use std::collections::HashMap;
use crate::actor::{get_handler, ActorHandler};
use crate::clean::clean_frame_data;
use crate::model::frame_data::FrameData;

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

        let mut frame_data = FrameData::with_capacity(count);
        let mut actors_handlers: HashMap<i32, Box<dyn ActorHandler>> = HashMap::new();
        let mut actors: HashMap<i32, HashMap<String, Attribute>> = HashMap::new();
        let mut actor_objects: HashMap<i32, String> = HashMap::new();
        let mut real_time: f32 = 0.0;

        for (i, frame) in frames.frames.iter().enumerate() {
            frame_data.times.push(frame.time);
            frame_data.deltas.push(frame.delta);
            real_time += frame.delta;

            for deleted in &frame.deleted_actors {
                actors_handlers.remove(&deleted.0);
                actors.remove(&deleted.0);
                actor_objects.remove(&deleted.0);
            }

            for new_actor in &frame.new_actors {
                actors.insert(new_actor.actor_id.0, HashMap::new());
                let object_name = match self.replay.objects.get(new_actor.object_id.0 as usize) {
                    None => continue,
                    Some(object_name) => object_name
                };
                actor_objects.insert(new_actor.actor_id.0, object_name.clone());

                let handler = match get_handler(object_name) {
                    None => continue,
                    Some(handler) => handler
                };

                actors_handlers.insert(new_actor.actor_id.0, handler);
            }

            for updated_actor in &frame.updated_actors {
                match actors.get_mut(&updated_actor.actor_id.0) {
                    None => continue,
                    Some(attributes) => {
                        match self.replay.objects.get(updated_actor.object_id.0 as usize) {
                            None => continue,
                            Some(object_name) => {
                                attributes.insert(object_name.clone(), updated_actor.attribute.clone());
                            }
                        };
                    }
                }
            }

            for updated_actor in &frame.updated_actors {
                let handler = match actors_handlers.get(&updated_actor.actor_id.0) {
                    None => continue,
                    Some(handler) => handler
                };

                let attributes = match actors.get(&updated_actor.actor_id.0) {
                    None => continue,
                    Some(attributes) => attributes
                };

                let object_name = match self.replay.objects.get(updated_actor.object_id.0 as usize) {
                    None => continue,
                    Some(object_name) => object_name
                };

                handler.update(real_time, i, &mut frame_data, &attributes, &object_name, &actors,
                               &actor_objects);
            }
        }

        let frame_data = clean_frame_data(frame_data);

        // for i in 0..frame_data.ball_data.position_times.len() - 1 {
        //     if frame_data.ball_data.position_times[i] > 37.55469 {
        //         break;
        //     }
        //     println!("{},{},{},{},{},{},{}  ",
        //              frame_data.ball_data.position_times[i],
        //              frame_data.ball_data.positions[i * 3],
        //              frame_data.ball_data.positions[i * 3 + 1],
        //              frame_data.ball_data.positions[i * 3 + 2],
        //              frame_data.ball_data.linear_velocity[i].x,
        //              frame_data.ball_data.linear_velocity[i].y,
        //              frame_data.ball_data.linear_velocity[i].z,
        //     );
        // }

        Ok(frame_data)
    }
}
