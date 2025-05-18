mod helpers;
mod routes;

use axum::{
    routing::{post},
    Router,
};
use routes::decode::post_decode_handler;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/api/v1/decode", post(post_decode_handler));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}