import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Text } from '@gluestack-ui/themed';

interface BottomNavigationProps {
  activeTab: 'camera' | 'gallery' | 'map';
  onTabPress: (tab: 'camera' | 'gallery' | 'map') => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const tabs = [
    { id: 'camera', label: 'Camera', icon: '📷' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'map', label: 'Map', icon: '🗺️' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, isActive && styles.activeTab]}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // 🔥 Makes tabs horizontal
    justifyContent: 'space-around', // Equal space
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  tabItem: {
    flex: 1, // 🔥 Makes each tab take equal width
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  icon: {
    fontSize: 22,
    color: '#888',
  },
  activeIcon: {
    color: '#1976D2',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  activeLabel: {
    color: '#1976D2',
    fontWeight: '600',
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
});

export default BottomNavigation;
