# System Design Document (SDD)
## Project: Workshop Order-Tracking System (Local Business Solution)

---

## 1. SYSTEM ARCHITECTURE & DATA FLOW

This system is built as an **offline-first Progressive Web App (PWA)** using a decoupled, client-heavy architecture. It is designed specifically to withstand the unstable cellular networks in rural areas while ensuring seamless text message integrations for feature phone end-users.

### 1.1 Core Components
*   **Frontend Client Layer (PWA):** Built using React and Tailwind CSS. It handles layout rendering, asset caching via Service Workers, and immediate offline data storage.
*   **Local Persistence Layer:** Driven by `Dexie.js` over the browser's native `IndexedDB` engine. It captures all user mutations instantly when offline.
*   **Ingestion Webhook Gateway:** An unauthenticated endpoint (`/api/webhooks/sms`) built into the backend to accept incoming HTTP `POST` notifications routed from telecommunication aggregators (e.g., Africa's Talking).
*   **Backend Application Layer:** A Node.js/Express REST API that manages batch synchronization routing, business logic execution, authentication, and communication pipes.
*   **Cloud Persistence Layer:** A Supabase PostgreSQL relational instance serving as the central single source of truth.

---

## 2. DATABASE ARCHITECTURE (SCHEMA CONFIGURATION)- See schema.sql

To support conflict-free synchronization, table records generated offline utilize client-generated **UUID v4 strings** as primary keys instead of auto-incrementing integers. High-precision transaction tracking relies on timestamps matching standard synchronization metrics.

### 2.1 Entity Relationship Diagram Configuration (See erd-diagram.drawio)
### 2.2 Relational Schema Specifications (PostgreSQL DDL)

---

## 3. OFFLINE-FIRST SYNC ENGINE Strategy

Data availability and resiliency are maintained through two coordinated synchronization vectors executed client-side.

### 3.1 Local Client Data Management (`Dexie.js`)
All transaction pipelines write directly to `IndexedDB` first. This guarantees immediate interface response speeds independent of active network strength.

### 3.2 Sync Coordination Architecture
Synchronization operates via a two-way differential transfer method using a Last-Write-Wins (LWW) conflict resolution rule based on the `client_updated_at` timestamp.

#### The Data Push Loop (`/api/sync/push`)
When network recovery triggers a connectivity event, the local engine acts on entries queued inside sync_queue.

#### The Data Pull Loop (`/api/sync/pull`)
To catch up with remote system adjustments made elsewhere, the application queries updates conditionally.

Client passes its maximum local `server_updated_at` date threshold to `/api/sync/pull?last_sync=TIMESTAMP`.

The server filters rows where `server_updated_at > query.last_sync`.

The response payload returns only the delta adjustments, which are then integrated back into the local `Dexie.js` stores.

---

## 4. SYSTEM BOUNDARIES & INTEGRATION PIPELINES

### 4.1 Asset Handling Workflow (Offline Binary Strategy)
**Capture**: The user takes an image of a garment or workpiece design offline.

**Compression**: Client-side JavaScript scales down resolution and compresses the image canvas structure to output a raw binary `Blob` object, keeping sizes under 200KB.

Local Store: The compressed Blob is written directly into the `order_photos` store in `IndexedDB`.

**Deferred Upload**: When full data synchronization runs successfully, the system reads the stored Blob data, runs a single multipart upload directly to Cloudinary storage, receives the return asset string URL, and updates the local and remote relational records.

### 4.2 Inbound Telecommunication Routing (Webhook Gateway)
Because feature phone interactions navigate cellular pathways rather than HTTP channels, network operators cannot reach application code routes natively.

---

## 5. APP DEPLOYMENT ARCHITECTURE