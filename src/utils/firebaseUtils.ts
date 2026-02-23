import { storage, db } from '../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Uploads a file from a local URI to Firebase Storage.
 * @param uri Local file URI (file://...)
 * @param folderName Folder in Firebase Storage (e.g., 'inspections')
 * @returns The download URL of the uploaded file
 */
export const uploadFileToFirebase = async (uri: string, folderName: string = 'inspections'): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const filename = uri.split('/').pop() || `file_${Date.now()}`;
    const storageRef = ref(storage, `${folderName}/${filename}`);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase:", error);
    throw error;
  }
};

/**
 * Saves a single observation to Firestore.
 * @param collectionPath Path to the collection (e.g., 'inspections/2026-02-10/items')
 * @param data The observation data object
 */
export const saveObservationToFirestore = async (collectionPath: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionPath), {
      ...data,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};
