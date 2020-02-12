mod utils;

use wasm_bindgen::prelude::*;
use crate::utils::set_panic_hook;

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
