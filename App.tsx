// App.tsx (Updated: Enhanced permission request with detailed logging and handling for Android versions)
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/stores';
import RootNavigator from './src/navigation/RootNavigator';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

export default function App() {
  useEffect(() => {
    const requestStoragePermission = async () => {
      console.log('App: Starting permission request process');
      if (Platform.OS === 'android') {
        let permissionKey;
        if (Platform.Version >= 33) {
          permissionKey = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
          console.log('App: Targeting Android 13+ - READ_MEDIA_IMAGES');
        } else {
          permissionKey = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
          console.log('App: Targeting Android <13 - READ_EXTERNAL_STORAGE');
        }

        const status = await check(permissionKey);
        console.log('App: Current permission status:', status);

        if (status === RESULTS.DENIED) {
          console.log('App: Permission denied, requesting...');
          const result = await request(permissionKey);
          console.log('App: Request result:', result);
          if (result === RESULTS.DENIED) {
            console.log('App: User permanently denied permission');
            Alert.alert(
              'Permission Required',
              'Storage permission is needed to select images. Please enable it in app settings.',
              [{ text: 'OK' }]
            );
          } else if (result === RESULTS.BLOCKED) {
            console.log('App: Permission blocked');
            Alert.alert(
              'Permission Blocked',
              'Storage permission is blocked. Please enable it in app settings.',
              [{ text: 'OK' }]
            );
          }
        } else if (status === RESULTS.GRANTED) {
          console.log('App: Permission already granted');
        } else {
          console.log('App: Unexpected status:', status);
        }
      } else {
        console.log('App: iOS - No permission request needed for gallery');
      }
    };

    requestStoragePermission();
  }, []);

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}