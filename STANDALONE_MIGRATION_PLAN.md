# Migration Plan: Standalone Property Inspection App

**Objective:** Extract the "Property Inspection" feature from the main Internal Audit superapp and establish it as a dedicated, standalone mobile application.

## 1. Rationale
*   **Focus:** Allows the Property Inspection app to have a specialized workflow without cluttering the main audit app.
*   **Performance:** Reduces bundle size and complexity for both apps.
*   **Deployment:** Independent update cycles for the Inspection team vs. the Safety/Audit team.

## 2. Phase 1: Clean Up Original App (Internal Audit)
*   [ ] **Remove Screen:** Delete `src/features/propertyInspection/screens/PropertyInspectionScreen.tsx`.
*   [ ] **Remove Data:** Delete `src/features/propertyInspection/data/propertyInspectionContent.ts` (if exists).
*   [ ] **Update Navigation:**
    *   Open `src/navigation/AppNavigator.tsx`.
    *   Remove the `PropertyInspection` route/tab.
    *   Remove the import statement.
*   [ ] **Clean Dependencies:** (Optional) If `expo-image-manipulator` is only used for this feature, it can be uninstalled from the main app.

## 3. Phase 2: Create New Standalone App
*   [ ] **Initialize:** Create a new Expo project (e.g., `property-inspector`).
    ```bash
    npx create-expo-app property-inspector --template blank-typescript
    ```
*   [ ] **Install Dependencies:**
    ```bash
    npx expo install firebase expo-image-picker expo-image-manipulator expo-file-system expo-sharing @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-safe-area-context react-native-screens
    ```
*   [ ] **Copy Core Files:**
    *   Copy `src/config/firebaseConfig.ts` (Ensure keys are correct).
    *   Copy `src/utils/firebaseUtils.ts`.
    *   Copy `src/utils/polyfills.ts` (If needed for other libraries, though less critical without local PDF gen).
*   [ ] **Migrate Screen Logic:**
    *   Copy the code from the old `PropertyInspectionScreen.tsx` into `App.tsx` (or a dedicated screen file) of the new project.
    *   *Note:* Ensure imports (like `Ionicons`) are correctly set up.

## 4. Phase 3: Connect to Web Dashboard
*   The **Web App** plan remains unchanged. It will simply connect to the *same Firebase project* that the new Standalone App writes to.
*   **Data Flow:**
    1.  **Standalone App:** Uploads observations to Firestore (`inspections/...`).
    2.  **Web Dashboard:** Reads from Firestore -> Generates PDF.

## 5. Execution Order
1.  **Create** the new app folder and initialize it.
2.  **Migrate** the code and get it running.
3.  **Verify** data upload works from the new app.
4.  **Delete** the feature from the old app only after the new one is proven working.
