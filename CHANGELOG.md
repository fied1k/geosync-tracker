# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- RELEASE_LOG_START -->

## [1.1.0] - 2026-10-05

### 🚀 Features
- feat: add automated versioning, changelog generation, and publish pipeline (`19b7181` by fied1k)

### 🐛 Bug Fixes
- fix: add .nojekyll and automated GitHub Pages deployment workflow with verification (`0d34241` by fied1k)

## [1.0.0] - 2026-10-05

### 🚀 Features
- **High-Accuracy GPS Plotting:** Capture mobile coordinates formatted strictly as `NN.NNNN, WWW.WWWW`.
- **CARTO Interactive Maps:** Raster basemap switching between Voyager, Light (Positron), and Dark (Dark Matter).
- **Multi-List Management:** Create, name, switch between, and retrieve multiple independent coordinate lists via the "My Lists" manager.
- **Dynamic QR Code Handshake:** Instantly open and synchronize lists on other devices via camera scan or web link.
- **Zero-Config Real-Time Cloud Sync:** Secure WebSocket room broadcasting with retained state snapshots (no account required).
- **Offline-First Storage:** LocalStorage backup with automatic bidirectional sync queue.
- **GIS Data Exports:** Formatted text, RFC 4180 CSV, and GeoJSON `FeatureCollection` formats.
- **Optional Firebase:** In-app connection dialog for custom Firestore backends.
