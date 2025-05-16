mod routes;

use axum::{
    routing::{get},
    Router,
};
use routes::decode::get_decoded_controller;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        .route("/api/v1/decode", get(get_decoded_controller));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}