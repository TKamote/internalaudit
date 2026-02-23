# Strategic Pivot: Mobile Data Collection & Web Reporting

## 1. Core Philosophy
*   **Mobile App:** Dedicated strictly to **Data Collection** (Speed, Photos, Offline capability).
*   **Firebase:** Acts as the **Central Sync Engine** (Storage & Database).
*   **Web App:** Dedicated to **Management & Reporting** (Editing, Formatting, PDF Generation).

## 2. Mobile App Refactoring (The Data Collector)
*   **Remove:** Local PDF generation logic (`jspdf` & `jspdf-autotable`).
*   **Add:** "Select from Gallery" feature (alongside Camera).
*   **Logic Change:**
    *   Images are uploaded to Firebase Storage immediately.
    *   Data (Location, Description, Category, Timestamp, Image URL) is saved to Firestore.
*   **Data Structure:**
    *   Collection: `inspections` (Grouped by Date/Project).
    *   Sub-collection: `observations` (Individual line items).

## 3. Web App Strategy (The Editor & Publisher)
*   **Role:** "Harvests" data from Firebase.
*   **Capabilities:**
    *   **Collation:** Aggregates observations from single or multiple auditors into one view.
    *   **Editing:** Allows fixing typos, adjusting descriptions, or swapping photos before printing.
    *   **Formatting:** Handles the complex PDF layout (Category grouping, Timestamp overlays) using browser engines.
*   **Output:** Generates the final high-quality PDF.

## 4. Workflow
1.  **Auditor** captures photos/notes on Mobile (or picks from Gallery).
2.  **App** syncs data to Firebase `inspections/{id}`.
3.  **Manager/Auditor** logs into Web App.
4.  **Web App** pulls data, sorts by Category (1-10).
5.  **Manager** reviews/edits data.
6.  **Web App** generates and downloads the final PDF.
