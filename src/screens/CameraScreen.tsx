import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Button,
  ButtonText,
  Text,
  VStack,
  HStack,
  Box,
  Progress,
  ProgressFilledTrack,
  Heading,
} from '@gluestack-ui/themed';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import locationService from '../services/location';
import firebaseService from '../services/firebase';
import { Location, UploadProgress } from '../types';
import RNFS from 'react-native-fs';

const screenWidth = Dimensions.get('window').width;

const CameraScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const locationGranted = await locationService.requestPermissions();
    setHasLocationPermission(locationGranted);

    if (!locationGranted) {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access to tag your photos with GPS coordinates.',
        [{ text: 'OK' }]
      );
    }
  };

 

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Failed to get your current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFileExists = async (uri: string) => {
    const filePath = uri.replace('file://', '');
    const exists = await RNFS.exists(filePath);
    console.log(`File exists: ${exists}`);
    return exists;
  };

  const handleImagePicker = async (response: ImagePickerResponse) => {
    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      const imageUri = asset.uri;

      const fileExists = await checkFileExists(imageUri);
      if (!fileExists) {
        Alert.alert('Error', 'Image file does not exist.');
        return;
      }

      const fileName = `photo_${Date.now()}.jpg`;
      const permanentPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      try {
        await RNFS.copyFile(imageUri.replace('file://', ''), permanentPath);
        setSelectedImage('file://' + permanentPath);
      } catch (err) {
        console.error("File copy failed", err);
        Alert.alert('Error', 'Failed to move image to accessible storage');
        return;
      }

      if (hasLocationPermission) {
        getCurrentLocation();
      }
    } else {
      Alert.alert('Error', 'No image selected.');
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        saveToPhotos: false,
      },
      handleImagePicker
    );
  };

  const pickFromGallery = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
      },
      handleImagePicker
    );
  };

  const uploadPhoto = async () => {
    if (!selectedImage || !currentLocation) {
      Alert.alert('Error', 'Please select an image and ensure location is available.');
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress({ progress: 0, state: 'uploading' });

      const fileName = `photo_${Date.now()}.jpg`;

      await firebaseService.uploadPhoto(
        selectedImage,
        fileName,
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: currentLocation.accuracy,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      Alert.alert('Success', 'Photo uploaded successfully!');
      resetSelection();
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress({ progress: 0, state: 'error', error: error.message || 'Upload failed' });
      Alert.alert('Upload Error', error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setCurrentLocation(null);
    setUploadProgress(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <VStack style={styles.content}>
        <Heading style={styles.heading}>📷 Photo Logger</Heading>

        {/* Image Preview */}
        {selectedImage && (
          <Box style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => {
                console.error('Image load error:', e.nativeEvent.error);
                Alert.alert('Error', 'Failed to load image');
              }}
            />
            <Button onPress={resetSelection} style={styles.resetButton}>
              <ButtonText>Reset</ButtonText>
            </Button>
          </Box>
        )}

        {/* Location Info */}
        {currentLocation && (
          <Box style={styles.locationContainer}>
            <Text style={styles.locationText}>
              📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
            {currentLocation.accuracy && (
              <Text style={styles.accuracyText}>
                Accuracy: ±{currentLocation.accuracy.toFixed(1)}m
              </Text>
            )}
          </Box>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <Box style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {uploadProgress.state === 'uploading'
                ? 'Uploading...'
                : uploadProgress.state === 'success'
                  ? 'Upload Complete!'
                  : 'Upload Failed'}
            </Text>
            <Progress value={uploadProgress.progress} style={styles.progress}>
              <ProgressFilledTrack />
            </Progress>
            <Text style={styles.progressPercent}>
              {uploadProgress.progress.toFixed(0)}%
            </Text>
          </Box>
        )}

        {/* Actions */}
        <VStack gap={15}>
          <HStack justifyContent="space-between" style={styles.buttonRow}>
            <Button onPress={takePhoto} isDisabled={isLoading} style={styles.button}>
              <ButtonText>📸 Take Photo</ButtonText>
            </Button>

            <Button onPress={pickFromGallery} isDisabled={isLoading} style={styles.button}>
              <ButtonText>🖼️ Pick from Gallery</ButtonText>
            </Button>
          </HStack>

          {selectedImage && currentLocation && (
            <Button onPress={uploadPhoto} isDisabled={isLoading} style={styles.uploadButton}>
              <ButtonText>{isLoading ? 'Uploading...' : '🚀 Upload to Firebase'}</ButtonText>
            </Button>
          )}

          {!hasLocationPermission && (
            <Button onPress={checkPermissions} style={styles.locationButton}>
              <ButtonText>📍 Enable Location</ButtonText>
            </Button>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginVertical: 20,
    width: screenWidth - 40,
    height: 300,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  locationContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    width: screenWidth - 40,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accuracyText: {
    fontSize: 14,
    color: '#888',
  },
  progressContainer: {
    width: screenWidth - 40,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    textAlign: 'center',
  },
  progress: {
    marginVertical: 10,
  },
  progressPercent: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    width: '48%',
  },
  uploadButton: {
    marginTop: 20,
  },
  locationButton: {
    marginTop: 20,
  },
});

export default CameraScreen;
