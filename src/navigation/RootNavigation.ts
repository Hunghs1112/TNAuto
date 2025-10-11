// src/navigation/RootNavigation.ts
import { createNavigationContainerRef, NavigationContainerRefWithCurrent, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Navigation types
    navigationRef.navigate(name, params);
  } else {
    console.warn('RootNavigation: Navigation not ready, cannot navigate to:', name);
  }
}

export function push(...args: any[]) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Navigation types
    navigationRef.dispatch(StackActions.push(...args));
  } else {
    console.warn('RootNavigation: Navigation not ready, cannot push');
  }
}

export function replace(name: string, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore - Navigation types
    navigationRef.dispatch(StackActions.replace(name, params));
  } else {
    console.warn('RootNavigation: Navigation not ready, cannot replace');
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  } else {
    console.warn('RootNavigation: Navigation not ready, cannot go back');
  }
}

export function isReady() {
  return navigationRef.isReady();
}

// Get current route name
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

