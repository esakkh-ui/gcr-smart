# GCR Smart Residence: VPS & OneSignal Migration

Migrating the application backend from Firebase to a self-hosted VPS and replacing Firebase Cloud Messaging (FCM) with OneSignal for push notifications.

> [!IMPORTANT]
> This architectural shift removes all reliance on Google Firebase. Data and authentication will be managed by a custom API at `api.gcr.id` (or the configured VPS URL).

- **Confirmed Decision**: Complete removal of Firebase (Auth & Firestore).
- **Confirmed Decision**: Replacement of FCM with OneSignal.
- **Recommended Default**: JWT (JSON Web Token) for authentication stored in localStorage.
- **Recommended Default**: RESTful polling for data updates to replace real-time Firestore listeners.

## 0. Pre-requisites & Required Data

To proceed with the implementation, please provide:
1.  **OneSignal App ID**: Required for push notification initialization.
2.  **VPS API URL**: The base URL (e.g., `https://api.gcr.id`) for all data requests.
3.  **Auth Endpoint Details**: What are the login fields (e.g., Username/Password or House Block/PIN)?
4.  **Data Models**: If the API structure differs from the previous Firestore schema (e.g., different field names for 'Complaints' or 'Residents'), please specify.

## 1. Overview & Core Concept

- **What It Does**: Transitions the GCR Smart Residence app to a traditional client-server architecture using a VPS-hosted backend and OneSignal for cross-platform notifications.
- **Target Audience**: Warga (Residents) and Administrators of Grand Ciledug Raya.
- **Key Value**: Greater control over data residency (VPS) and more robust push notification delivery (OneSignal).

## 2. User Experience & Visual Design

- **Key User Flows**:
    - **Login**: User enters credentials (House Block or Admin ID) -> VPS verifies -> returns JWT.
    - **Data Interaction**: App fetches data (Complaints, IPL, SOS) via standard GET/POST requests.
    - **Notifications**: OneSignal initializes on app start, registers device ID, and links it to the User ID on the VPS.
- **Visual Identity**:
    - *Aesthetic*: Minimalist SaaS dashboard for Admin, ergonomic touch-first layout for Residents.
    - *Theme*: High-contrast light/dark modes (Tailwind v4) optimized for outdoor mobile use.
- **Interactive Feedback**:
    - Full loading skeletons for API fetches.
    - Toast notifications for API success/failure (replacing quiet Firestore syncs).

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Authentication Strategy**
    - *Chosen Approach*: JWT-based Auth.
    - *Why*: Standard for VPS backends; allows secure access to private endpoints without a persistent socket.
- **Decision 2: Real-time Updates**
    - *Chosen Approach*: Smart Polling (refresh on visibility/open) + On-demand refresh.
    - *Why*: Simplifies the backend by removing the need for a complex WebSocket/PubSub layer while maintaining "fresh-enough" data for residential use.

## 4. Technical Architecture & Data Strategy

```unicode
┌─────────────────────────────────────────────────────────────┐
│                    React / Capacitor App                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ AuthContext  │    │ DataContext  │    │ OneSignal SDK│   │
│  │ (JWT Store)  │    │ (API Fetch)  │    │ (Push Regis) │   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
└─────────┼───────────────────┼───────────────────┼───────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌───────────────────┐   ┌───────────────────┐   ┌─────────────┐
│  VPS API Server   │   │   VPS Database    │   │  OneSignal  │
│  (api.gcr.id)     │   │ (Postgres/MySQL)  │   │   Cloud     │
└───────────────────┘   └───────────────────┘   └─────────────┘
```

- **Data Model & State**:
    - `User`: Managed via `/auth/login` and `/auth/me`.
    - `Data Entities`: Standard CRUD endpoints (e.g., `GET /api/complaints`).
- **Interactive Component & State Mapping**:
    - `AuthProvider`: Manages `token` and `currentUser` state.
    - `DataProvider`: Orchestrates `fetch` calls and global state for Residents/Houses/Complaints.
    - `NotificationUtil`: Wraps OneSignal initialization and player ID registration.

## 5. Migration Steps

1. **Cleanup**: Uninstall `firebase` and remove `src/firebase/config.ts`.
2. **OneSignal Setup**: Install OneSignal SDK and initialize with App ID.
3. **API Client**: Create `src/api/client.ts` as a wrapper for `fetch` with Bearer headers.
4. **Context Rewrite**: Re-implement `AuthContext.tsx` and `DataContext.tsx` to use the new API client.
5. **Validation**: Verify all Resident/Admin flows against the VPS endpoints.
