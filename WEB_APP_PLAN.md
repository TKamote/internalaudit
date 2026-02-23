# Web Application Specification: Inspection Manager

## 1. Technology Stack
*   **Framework:** React (Vite) or Next.js (for easy deployment).
*   **Language:** TypeScript.
*   **Backend/DB:** Firebase SDK (Auth, Firestore, Storage).
*   **Styling:** Tailwind CSS.
*   **PDF Engine:** `jspdf` + `jspdf-autotable` (running in browser environment).

## 2. Core Features

### A. Authentication
*   Login screen (Email/Password).
*   Secure access to Firestore data.

### B. Dashboard (Inspection List)
*   Display list of inspection reports (e.g., "Daily Inspection - 10 Feb 2026").
*   Status indicators (In Progress, Completed, Generated).
*   "Create New" button (optional, if web users start inspections).

### C. Inspection Editor (The "Harvesting" View)
*   **Table View:** Displays all observations for a selected inspection.
*   **Sorting:** Automatically groups items by Category (1. Landscape, 2. Fire Safety, etc.).
*   **Editing:**
    *   Inline editing for "Location" and "Description".
    *   Dropdown for changing "Category".
    *   Image preview with "Replace" option.
    *   "Add Row" button (for desktop-based additions).
*   **Delete:** Remove unwanted observations.

### D. PDF Generation Module
*   **Layout:** Recreates the 5-column layout (S/N, Location, Photo, Description, Remarks).
*   **Image Processing:** 
    *   Fetches high-res images from Firebase Storage.
    *   **Timestamp Overlay:** Draws the timestamp (from Firestore data) onto the image canvas before adding to PDF.
    *   **Alignment:** Handles the specific top-left alignment and column widths requested.
*   **Download:** Exports `Property_Inspection_DDMMYYYY.pdf`.

## 3. Data Schema (Firestore)
**Path:** `inspections/{inspectionId}/items/{itemId}`

```typescript
interface InspectionItem {
  id: string;
  category: string;      // "1. Landscape"
  location: string;
  description: string;
  photoUrl: string;      // Firebase Storage URL
  timestamp: number;     // Unix Timestamp
  auditorId: string;     // User ID
  createdAt: FieldValue; // Server Timestamp
}
```

## 4. Development Phases
1.  **Setup:** Initialize React project & Firebase connection.
2.  **Read:** Fetch and display observations in a grouped table.
3.  **Write:** Implement inline editing and saving to Firestore.
4.  **Export:** Build the PDF generation engine with timestamp overlay logic.
