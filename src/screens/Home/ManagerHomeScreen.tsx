import React from 'react';
import { useManagerHomeScreen } from '../../hooks/useManagerHomeScreen';
import ManagerHomeScreenView from './ManagerHomeScreenView';

export default function ManagerHomeScreen() {
  const viewModel = useManagerHomeScreen({ isEnabled: true });
  return <ManagerHomeScreenView {...viewModel} />;
}
