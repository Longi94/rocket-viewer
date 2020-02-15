mod utils;
mod models;
mod parser;
mod actor;

use wasm_bindgen::prelude::*;
use crate::utils::set_panic_hook;
use crate::models::CleanedReplay;
use crate::parser::FrameParser;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn parse_replay(data: &[u8]) -> JsValue {
    set_panic_hook();

    let parse_result = boxcars::ParserBuilder::new(data)
        .on_error_check_crc()
        .parse();

    match parse_result {
        Ok(replay) => JsValue::from_serde(&replay).unwrap(),
        Err(err) => JsValue::from_str(&err.to_string())
    }
}

#[wasm_bindgen]
pub fn parse_and_clean_replay(data: &[u8]) -> JsValue {
    //set_panic_hook();

    let parse_result = boxcars::ParserBuilder::new(data)
        .on_error_check_crc()
        .parse();

    let replay = match parse_result {
        Err(err) => return JsValue::from_str(&err.to_string()),
        Ok(replay) => replay
    };

    let parser = FrameParser {replay: &replay};

    let frame_data_result = parser.parse();

    let frame_data = match frame_data_result {
        Err(err) => return JsValue::from_str(&err),
        Ok(frame_data) => frame_data
    };

    let cleaned = CleanedReplay {
        major_version: replay.major_version,
        minor_version: replay.minor_version,
        net_version: replay.net_version,
        game_type: replay.game_type,
        keyframes: replay.keyframes,
        properties: replay.properties,
        tick_marks: replay.tick_marks,
        frame_data
    };

    return JsValue::from_serde(&cleaned).unwrap();
}
