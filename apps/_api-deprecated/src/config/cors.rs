use tower_http::cors::{CorsLayer, AllowOrigin, Any};
use axum::http::{Method/*, HeaderValue*/};
// use std::env;

pub fn build_cors_layer() -> CorsLayer {    
    // let allowed_origins = vec![
    //     format!("chrome-extension://{}", env::var("CHROME_EXTENSION_ID").unwrap_or_default()),
    // ];

    // let origins: Vec<HeaderValue> = allowed_origins
    //     .into_iter()
    //     .filter_map(|origin| HeaderValue::from_str(&origin).ok())
    //     .collect();

    CorsLayer::new()
        .allow_origin(AllowOrigin::any()) // Allow all origins for now
        // .allow_origin(AllowOrigin::list(origins))
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any)
}