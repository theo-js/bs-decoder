use axum::{Json, http::StatusCode};

pub async fn get_decoded_controller() -> (StatusCode, Json<String>) {
    (StatusCode::OK, Json("Decoded data".to_string()))
}