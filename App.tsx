/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import "./global.css";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import CameraScreen from './src/screens/CameraScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import MapScreen from './src/screens/MapScreen';
import BottomNavigation from './src/components/BottomNavigation';
import { firebaseConfig } from './firebaseConfig';
import firebase from '@react-native-firebase/app';

// Only initialize if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'camera' | 'gallery' | 'map'>('camera');

  const renderScreen = () => {
    switch (activeTab) {
      case 'camera':
        return <CameraScreen />;
      case 'gallery':
        return <GalleryScreen />;
      case 'map':
        return <MapScreen />;
      default:
        return <CameraScreen />;
    }
  };

  return (
    <GluestackUIProvider colorMode="light">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        {renderScreen()}
        <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />
      </SafeAreaView>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;
