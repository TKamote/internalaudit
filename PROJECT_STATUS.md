# Project Status: Internal Audit App

**Date:** February 10, 2026
**Current Phase:** Strategic Pivot - Hybrid Mobile/Web Architecture
**Expo SDK:** 54 (New Architecture Enabled)

## 1. Project Overview
A hybrid system for conducting internal audits. The **Mobile App** focuses on rapid data collection and evidence capture, while the **Web App** handles management, editing, and high-quality PDF report generation.

### **Core Modules**
1.  **Property Inspection (New Strategy):**
    *   **Mobile:** Captures observations (Category, Location, Description, Photo) and syncs to Cloud.
    *   **Web:** "Harvests" data, allows editing/refinement, and generates the final PDF report.
2.  **Daily Tool Box Meeting (TBM):**
    *   *Legacy Mode:* Generates PDF locally on device (for now).
3.  **FSM Periodic Inspection:**
    *   *Legacy Mode:* Generates PDF locally on device (for now).

## 2. Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Expo SDK 54** | Mobile App Framework. |
| **Cloud Backend** | **Firebase** | **Auth, Firestore, Storage** (Central Sync Engine). |
| **Web App** | **React (Vite/Next.js)** | *Planned:* Admin Dashboard for report generation. |
| **Mobile Language** | **TypeScript** | Static typing. |
| **Image Processing** | **Expo Image Manipulator** | Compressing images before upload (Max 1024px, 50% quality). |
| **PDF Generation** | **jsPDF (Web)** | *Moved to Web App* for Property Inspection. |

## 3. Recent Achievements
*   ✅ **Strategic Pivot:** Shifted "Property Inspection" from local PDF generation to a **Cloud Sync** model.
*   ✅ **Cloud Integration:** Implemented Firebase Storage (Photos) and Firestore (Data) uploading.
*   ✅ **Performance Optimization:** Added `expo-image-manipulator` to resize/compress images, reducing upload times from minutes to seconds.
*   ✅ **Gallery Support:** Added ability to pick images from device gallery.

## 4. Current Tasks & Next Steps
1.  **Mobile Validation:**
    *   Verify fast upload speeds with new image compression.
    *   Confirm data appears correctly in Firestore.
2.  **Web App Development:**
    *   Initialize React project.
    *   Connect to shared Firebase project.
    *   Build "Inspection Editor" table.
    *   Implement PDF generation engine on the web.

## 5. Known Constraints
*   **Legacy Modules:** TBM and FSM modules still use local `jspdf` generation. Do not remove `jspdf` dependencies from `package.json`.
