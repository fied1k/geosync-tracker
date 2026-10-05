# GeoSync — Real-Time Coordinate Tracker & Plotter

![Version](https://img.shields.io/badge/version-v1.1.0-blue.svg)

> **Live Web Application:** [https://fied1k.github.io/geosync-tracker/](https://fied1k.github.io/geosync-tracker/)

**GeoSync** is a lightweight, zero-install mapping and coordinate tracking web application designed for field surveys, location plotting, and real-time collaboration across devices. Capture your current coordinates on mobile via device GPS or tap directly on the interactive CARTO map.

All captured coordinates adhere strictly to a 4-decimal precision format (`NN.NNNN, WWW.WWWW`), can be grouped under multiple custom survey lists, and sync live across devices with dynamic QR codes or shareable links.

---

## 🚀 Key Features

* 📍 **One-Tap GPS Capture:** Log your exact current location using high-accuracy mobile GPS hardware.
* 🗺️ **CARTO Interactive Maps:** Seamless raster basemap switching between **Voyager** (default), **Light** (Positron), and **Dark** (Dark Matter).
* 📋 **Multi-List Management:** Create, name, switch between, and manage multiple independent coordinate lists directly in the **"My Lists"** drawer.
* 📲 **Dynamic QR Code & Cross-Device Sync:** Open any list on another phone, tablet, or desktop by scanning a generated QR code or sharing a web link.
* ⚡ **Zero-Config Real-Time Cloud Sync:** Changes broadcast in real-time (<50ms) across all devices in a room over secure cloud WebSockets—no logins, accounts, or API keys required.
* 💾 **Offline-First Resilience:** Changes are mirrored in browser `localStorage`. Offline mutations automatically sync once reconnected.
* 📤 **Multi-Format GIS Export:**
  * **Plain Text:** `NN.NNNN, WWW.WWWW (Point Name)`
  * **CSV:** RFC 4180 quote-escaped spreadsheet format (`Name`, `Formatted_Coordinates`, `Latitude`, `Longitude`, `Notes`)
  * **GeoJSON:** RFC 7946 standard `FeatureCollection` for QGIS, ArcGIS, or Mapbox import.
* 🔒 **Optional Custom Database:** Connect your own private Google Firebase / Cloud Firestore project via the built-in database settings modal.

---

## 📱 How It Works

1. **Open the App:** Visit [https://fied1k.github.io/geosync-tracker/](https://fied1k.github.io/geosync-tracker/) on any mobile phone, tablet, or desktop browser.
2. **Plot Coordinates:** Tap **"Capture Current Location"** or tap directly on the map to drop a pin.
3. **Name & Annotate:** Add point labels (e.g. `Gate #1`, `Soil Sample A`) and notes.
4. **Create Multiple Lists:** Tap **"My Lists"** to start new surveys, switch between existing ones, or retrieve lists by code.
5. **Share & Collaborate:** Tap **"Scan QR / Sync"** and point another phone camera at the screen to load and sync the exact same survey in real time.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS | Self-contained single-page application (SPA) |
| **Mapping Engine** | Leaflet.js (v1.9.4) | Interactive canvas, custom div markers, viewport controls |
| **Tiles Provider** | CARTO Raster Basemaps | Voyager, Light, and Dark Matter styles |
| **Real-time Sync** | MQTT over Secure WebSocket | Cloud broker (`wss://broker.hivemq.com:8884/mqtt`) with retained snapshots |
| **QR Code Engine** | QRCode.js (v1.0.0) | Dynamic client-side QR generation |
| **Cloud Database (Optional)** | Firebase v11.6.1 | Cloud Firestore modular SDK with anonymous auth |

---

## 📄 License & Handover

See [`HANDOVER.md`](HANDOVER.md) for detailed technical specifications and API handover documentation.
Licensed under the [MIT License](LICENSE).

## 📦 Latest Release
* **Version:** [v1.1.0](https://github.com/fied1k/geosync-tracker/releases/tag/v1.1.0) (2026-10-05)
* **Changelog:** See [CHANGELOG.md](CHANGELOG.md) for full history.

