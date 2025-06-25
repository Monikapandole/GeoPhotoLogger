import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
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

const { width } = Dimensions.get('window');

const GalleryScreen: React.FC = () => {
  const [photos, setPhotos] = useState<FirebasePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<FirebasePhoto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const fetchedPhotos = await firebaseService.getPhotos();
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoPress = (photo: FirebasePhoto) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handleDeletePhoto = async (photo: FirebasePhoto) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.deletePhoto(photo.id);
              setPhotos(photos.filter(p => p.id !== photo.id));
              Alert.alert('Success', 'Photo deleted successfully!');
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openInMaps = (photo: FirebasePhoto) => {
    const { latitude, longitude } = photo.location;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    // You can use Linking.openURL(url) here if you import Linking from react-native
    Alert.alert('Open in Maps', `Would open: ${url}`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderPhotoItem = ({ item }: { item: FirebasePhoto }) => (
    <Box style={styles.photoCard}>
      <TouchableOpacity onPress={() => handlePhotoPress(item)}>
        <Image source={{ uri: item.imageUrl }} style={styles.photoThumbnail} />
      </TouchableOpacity>
      
      <VStack style={styles.photoInfo}>
        <Text style={styles.photoDate}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.photoLocation}>
          📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
        </Text>
        {item.location.accuracy && (
          <Text style={styles.photoAccuracy}>
            Accuracy: ±{item.location.accuracy.toFixed(1)}m
          </Text>
        )}
        
        <HStack style={styles.photoActions}>
          <Button
            onPress={() => openInMaps(item)}
            style={styles.actionButton}
          >
            <ButtonText>🗺️ Maps</ButtonText>
          </Button>
          <Button
            onPress={() => handleDeletePhoto(item)}
            style={styles.deleteButton}
          >
            <ButtonText>🗑️ Delete</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VStack style={styles.header}>
        <Heading style={styles.title}>🖼️ Photo Gallery</Heading>
        <Text style={styles.subtitle}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
        </Text>
      </VStack>

      {photos.length === 0 ? (
        <Box style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No photos uploaded yet</Text>
          <Text style={styles.emptySubtext}>
            Take some photos and upload them to see them here!
          </Text>
        </Box>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.photoList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Full Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalContent}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          >
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto.imageUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  photoList: {
    padding: 10,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  photoInfo: {
    marginTop: 10,
  },
  photoDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  photoLocation: {
    fontSize: 14,
    marginBottom: 3,
  },
  photoAccuracy: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 10,
  },
  photoActions: {
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#f44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullImage: {
    width: width,
    height: width * 0.75,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default GalleryScreen; 