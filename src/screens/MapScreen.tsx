import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import {
  Text,
  VStack,
  HStack,
  Box,
  Button,
  ButtonText,
  Heading,
  Spinner,
} from '@gluestack-ui/themed';
import firebaseService from '../services/firebase';
import { FirebasePhoto } from '../types';

const { width, height } = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const [photos, setPhotos] = useState<FirebasePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<FirebasePhoto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    console.log("sdfdfdfg------>")
    try {
      setLoading(true);
      const fetchedPhotos = await firebaseService.getPhotos();
      setPhotos(fetchedPhotos);
      
      // Set initial region to first photo if available
      if (fetchedPhotos.length > 0) {
        const firstPhoto = fetchedPhotos[0];
        setRegion({
          latitude: firstPhoto.location.latitude,
          longitude: firstPhoto.location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (photo: FirebasePhoto) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMarkerColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VStack style={styles.header}>
        <Heading style={styles.title}>🗺️ Photo Map</Heading>
        <Text style={styles.subtitle}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''} on map
        </Text>
      </VStack>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}

      >
        {photos.map((photo, index) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.location.latitude,
              longitude: photo.location.longitude,
            }}
            pinColor={getMarkerColor(index)}
            onPress={() => handleMarkerPress(photo)}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Image
                  source={{ uri: photo.imageUrl }}
                  style={styles.calloutImage}
                />
                <Text style={styles.calloutTitle}>
                  Photo #{index + 1}
                </Text>
                <Text style={styles.calloutDate}>
                  {formatDate(photo.timestamp)}
                </Text>
                <Text style={styles.calloutLocation}>
                  {photo.location.latitude.toFixed(4)}, {photo.location.longitude.toFixed(4)}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Photo Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <VStack style={styles.modalInner}>
                <Image
                  source={{ uri: selectedPhoto.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                
                <VStack style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>
                    📸 Photo Details
                  </Text>
                  <Text style={styles.modalDate}>
                    📅 {formatDate(selectedPhoto.timestamp)}
                  </Text>
                  <Text style={styles.modalLocation}>
                    📍 {selectedPhoto.location.latitude.toFixed(6)}, {selectedPhoto.location.longitude.toFixed(6)}
                  </Text>
                  {selectedPhoto.location.accuracy && (
                    <Text style={styles.modalAccuracy}>
                      🎯 Accuracy: ±{selectedPhoto.location.accuracy.toFixed(1)}m
                    </Text>
                  )}
                  {selectedPhoto.fileSize && (
                    <Text style={styles.modalFileSize}>
                      💾 Size: {(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  )}
                </VStack>

                <HStack style={styles.modalActions}>
                  <Button
                    onPress={() => setModalVisible(false)}
                    style={styles.closeModalButton}
                  >
                    <ButtonText>Close</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            )}
          </View>
        </View>
      </Modal>

      {/* Floating Info Panel */}
      {photos.length > 0 && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            Tap markers to view photo details
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDate: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  calloutLocation: {
    fontSize: 12,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalInner: {
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalInfo: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalLocation: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalAccuracy: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalFileSize: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalActions: {
    justifyContent: 'center',
  },
  closeModalButton: {
    backgroundColor: '#2196F3',
    minWidth: 100,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default MapScreen; 