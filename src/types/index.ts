export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Photo {
  id: string;
  uri: string;
  location: Location;
  timestamp: number;
  fileName: string;
  fileSize?: number;
  type?: string;
}

export interface FirebasePhoto {
  id: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timestamp: number;
  fileName: string;
  fileSize?: number;
  type?: string;
}

export interface UploadProgress {
  progress: number;
  state: 'uploading' | 'success' | 'error';
  error?: string;
} 