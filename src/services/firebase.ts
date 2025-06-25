import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { FirebasePhoto, UploadProgress } from '../types';

class FirebaseService {
  private storageRef = storage();
  private firestoreRef = firestore();

  async uploadPhoto(
    uri: string,
    fileName: string,
    location: { latitude: number; longitude: number; accuracy?: number },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      // Create a unique file name
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${fileName}`;
      const storagePath = `photos/${uniqueFileName}`;
      
      // Upload to Firebase Storage
      const fileRef = this.storageRef.ref(storagePath);
      
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload with progress tracking
      const uploadTask = fileRef.put(blob);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({
            progress,
            state: 'uploading'
          });
        },
        (error) => {
          onProgress?.({
            progress: 0,
            state: 'error',
            error: error.message
          });
        },
        async () => {
          // Upload completed, get download URL
          const downloadURL = await fileRef.getDownloadURL();
          
          // Save metadata to Firestore
          const photoData: FirebasePhoto = {
            id: uniqueFileName,
            imageUrl: downloadURL,
            location,
            timestamp,
            fileName,
            fileSize: blob.size,
            type: blob.type
          };
          
          await this.firestoreRef.collection('photos').doc(uniqueFileName).set(photoData);
          
          onProgress?.({
            progress: 100,
            state: 'success'
          });
        }
      );
      
      return uniqueFileName;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  async getPhotos(): Promise<FirebasePhoto[]> {
    try {
      const snapshot = await this.firestoreRef
        .collection('photos')
        .orderBy('timestamp', 'desc')
        .get();
      
      return snapshot.docs.map(doc => doc.data() as FirebasePhoto);
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  }

  async deletePhoto(photoId: string): Promise<void> {
    try {
      // Delete from Firestore
      await this.firestoreRef.collection('photos').doc(photoId).delete();
      
      // Delete from Storage
      await this.storageRef.ref(`photos/${photoId}`).delete();
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }
}

export default new FirebaseService(); 