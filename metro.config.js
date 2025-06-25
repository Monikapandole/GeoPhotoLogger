const {withNativeWind} = require('nativewind/metro');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    alias: {
      'react-dom': path.resolve(__dirname, 'react-dom.js'),
    },
    platforms: ['native', 'ios', 'android'],
  },
});

module.exports = withNativeWind(config, {
 input: "./global.css"
});
