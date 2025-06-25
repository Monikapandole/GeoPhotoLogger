import Geolocation from 'react-native-geolocation-service';
import { Location } from '../types';
import { Platform, PermissionsAndroid } from 'react-native';

class LocationService {
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Request permission using Geolocation API
        const result = await Geolocation.requestAuthorization('whenInUse');
        return result === 'granted';  // Returns true if granted
      } else if (Platform.OS === 'android') {
        // Android: Request permission using PermissionsAndroid API
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;  // True if granted
      }
      return false;  // Unsupported platform or error
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      );
    });
  }

  async watchLocation(callback: (location: Location) => void): Promise<number> {
    return new Promise((resolve, reject) => {
      const watchId = Geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          callback(location);
        },
        (error) => {
          console.error('Error watching location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10, // Update every 10 meters
          interval: 5000, // Update every 5 seconds
          fastestInterval: 2000 // Fastest update every 2 seconds
        }
      );
      resolve(watchId);
    });
  }

  stopWatchingLocation(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }
}

export default new LocationService(); 