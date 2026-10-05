# Project Handover Document: GeoSync Coordinate Tracker

**Project Name:** GeoSync Coordinate Tracker  
**Target Environment:** Web / Mobile Web Browsers (Single-page Application)  
**Primary Deliverable:** `index.html` (Self-contained SPA)  
**Handover Date:** October 2026  

---

## 1. Project Overview & Objectives

GeoSync is a client-side mapping and coordinate tracking web application designed for field surveys, location logging, and cross-device collaboration. It allows users to plot coordinates either automatically via high-accuracy device GPS or manually by tapping on an interactive map. 

All captured coordinates adhere to a 4-decimal precision format (`NN.NNNN, WWW.WWWW`), can be grouped under custom titled lists, and can be synchronized in real-time across devices via a shareable link or dynamic QR code.

---

## 2. Technical Stack & External Integrations

| Layer / Concern | Technology / Library | Details / CDN Links |
| :--- | :--- | :--- |
| **Markup & Layout** | HTML5, Tailwind CSS | Script-injected via CDN (`cdn.tailwindcss.com`) |
| **Typography & Icons** | Google Fonts (Inter, JetBrains Mono), Font Awesome 6.5.1 | Inter for general UI, JetBrains Mono for coordinates |
| **Mapping Engine** | Leaflet.js (v1.9.4) | `leaflet.js` & `leaflet.css` |
| **Basemap Provider** | CARTO Raster Basemaps | Tile URLs configured with CARTO API key |
| **QR Code Generation** | QRCode.js (v1.0.0) | Client-side dynamic QR canvas generation |
| **Real-time Data Sync** | Firebase v11.6.1 (Modular SDK) | Firebase Auth (Anonymous/Custom) & Cloud Firestore |

---

## 3. Configuration & API Keys

### 3.1 CARTO Basemap API
- **API Key:** `cb1_3ywj_2_3df8d9091c5b62104e8f7613`
- **Active Endpoints:**
  - **Voyager (Default):**  
    `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_3ywj_2_3df8d9091c5b62104e8f7613`
  - **Positron (Light Mode):**  
    `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=cb1_3ywj_2_3df8d9091c5b62104e8f7613`
  - **Dark Matter (Dark Mode):**  
    `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=cb1_3ywj_2_3df8d9091c5b62104e8f7613`

### 3.2 Firebase Environment Configuration
The application reads runtime globals if injected by the host:
- `__firebase_config`: Stringified JSON containing Firebase credentials. Falls back to a local mock configuration if absent.
- `__app_id`: Application namespace identifier (defaults to `'geosync-tracker-default'`).
- `__initial_auth_token`: Optional auth token for custom authenticated environments; falls back to anonymous sign-in (`signInAnonymously`).

---

## 4. Key Functional Specifications

### 4.1 Coordinate Precision Rule
- All displayed, logged, and exported coordinates must strictly follow the format:
  $$\text{NN.NNNN, WWW.WWWW}$$
- Implemented in code by the `formatCoord4(lat, lng)` function:
  ```javascript
  function formatCoord4(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return "00.0000, 000.0000";
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  ```

### 4.2 Multi-List Management & Cross-Device Synchronization
- **Multiple Saved Lists:** Users can create, name, switch between, and delete multiple independent coordinate lists directly in the UI via the **"My Lists"** manager.
- **List Registry & History:** All created or retrieved lists are remembered in the user's local registry with pin counts and update timestamps.
- **List Retrieval by Code or Link:** Users can join any existing list by scanning a QR code, clicking a shared web link, or pasting a short List ID into the "Retrieve List" input.
- **Zero-Config Real-Time Cloud Engine:** Each list maps to an isolated cloud synchronization channel (`geosync/v2/{listId}`) over secure WebSockets with retained state snapshots, ensuring instant data delivery to brand-new visitors and cross-device live collaboration without requiring logins or accounts.
- **Offline / Local Fallback:** Changes are mirrored directly to browser `localStorage` under `geosync_{listId}` so data remains accessible even with spotty connectivity. Optional custom Firebase credentials can be configured directly via the in-app database modal.

### 4.3 Data Export Formats
The **Export** dialog provides one-click copy support for:
1. **Plain Text List:** Standard `NN.NNNN, WWW.WWWW (Point Name)` line format.
2. **CSV:** Columns for `Name`, `Formatted_Coordinates`, `Latitude`, `Longitude`, and `Notes` adhering strictly to RFC 4180 quotes escaping.
3. **GeoJSON:** Standard `FeatureCollection` with `Point` geometry for GIS import (e.g., QGIS, ArcGIS).

---

## 5. UI & Responsive Design Structure

- **Desktop (1024px+):** Fixed left sidebar (`w-96`) displaying the list title editor, GPS action button, pin count, and point cards. Full right canvas for the CARTO map.
- **Mobile / Tablet (<1024px):** Map occupies 100% of the screen. Sidebar transforms into a slide-over drawer toggled via the hamburger icon (`#btnToggleList`).
- **Floating Controls:** A direct **"Scan to open on phone"** button is placed above the map canvas for quick device onboarding.

---

## 6. Maintenance & Future Considerations

1. **CARTO Key Rotation:** If the CARTO API key expires or usage limits change, update the constant `CARTO_KEY` near line 258 of `index.html`.
2. **Offline Tile Caching:** For remote field surveys completely disconnected from the internet, a service worker can be integrated to cache raster map tiles via IndexedDB or the Cache API.
3. **Authentication Upgrade:** If access control per user is required instead of public room IDs, migrate Firebase Authentication from anonymous sign-ins to email/password or OAuth providers (Google/GitHub).
4. **Coordinate Conversions:** If future requirements require UTM, MGRS, or DMS (Degrees Minutes Seconds), add a converter utility that toggles coordinate output while keeping the raw lat/lng values unchanged.
