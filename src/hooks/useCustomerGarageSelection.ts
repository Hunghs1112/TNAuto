import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useAppDispatch } from '../redux/hooks/useAppDispatch';
import { useAppSelector } from '../redux/hooks/useAppSelector';
import { selectGarageCode, selectGarageResolved } from '../redux/selectors';
import {
  GaragePayload,
  saveAndSetActiveGarage,
  upsertSavedGarage,
} from '../redux/slices/garageContextSlice';
import { GarageSummary, useAddCustomerGarageMutation } from '../services/authApi';

type GarageInput = Partial<GarageSummary> & {
  garageId?: string | number | null;
  garageCode?: string | null;
  garageName?: string | null;
  avatarUrl?: string | null;
};

interface AddGarageOptions {
  activate?: boolean;
  source?: 'manual' | 'saved_list' | 'tab' | 'qr';
}

const normalizeGarageCode = (value?: string | null) => value?.trim().toUpperCase() || '';

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.error ||
  fallback;

const mapGarageInputToPayload = (garage: GarageInput): GaragePayload => ({
  garageId: garage.garageId ?? garage.id,
  garageCode: garage.garageCode ?? garage.code,
  garageName: garage.garageName ?? garage.name,
  address: garage.address,
  avatarUrl: garage.avatarUrl ?? garage.avatar_url,
  status: garage.status,
  resolved: true,
});

const mergeGaragePayload = (payload: GaragePayload, garage?: GarageSummary): GaragePayload => ({
  ...payload,
  garageId: garage?.id ?? payload.garageId,
  garageCode: garage?.code ?? payload.garageCode,
  garageName: garage?.name ?? payload.garageName,
  address: garage?.address ?? payload.address,
  avatarUrl: garage?.avatar_url ?? payload.avatarUrl,
  status: garage?.status ?? payload.status,
  resolved: true,
});

export const useCustomerGarageSelection = () => {
  const dispatch = useAppDispatch();
  const currentGarageCode = useAppSelector(selectGarageCode);
  const garageResolved = useAppSelector(selectGarageResolved);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const userType = useAppSelector((state) => state.auth.userType);
  const userId = useAppSelector((state) => state.auth.userId);
  const [addCustomerGarage] = useAddCustomerGarageMutation();

  const isCustomerAccount = isLoggedIn && userType === 'customer';

  const syncGarageMembership = useCallback(
    async (
      payload: GaragePayload,
      source: AddGarageOptions['source'] = 'manual',
    ): Promise<GaragePayload | null> => {
      const normalizedCode = normalizeGarageCode(payload.garageCode);

      console.log('[GarageSelection] syncGarageMembership start', {
        inputPayload: payload,
        normalizedCode,
        source,
        isCustomerAccount,
        userId,
      });

      if (!normalizedCode) {
        console.log('[GarageSelection] syncGarageMembership stop: empty normalizedCode');
        return null;
      }

      if (!isCustomerAccount) {
        const nonCustomerPayload = {
          ...payload,
          garageCode: normalizedCode,
          resolved: true,
        };
        console.log('[GarageSelection] syncGarageMembership non-customer success', nonCustomerPayload);
        return nonCustomerPayload;
      }

      const customerId = Number(userId);

      if (!Number.isFinite(customerId) || customerId <= 0) {
        console.log('[GarageSelection] syncGarageMembership invalid customerId', { userId, customerId });
        Alert.alert(
          'Không thể thêm gara',
          'Không tìm thấy customer_id hợp lệ để gắn gara vào tài khoản này.',
        );
        return null;
      }

      try {
        const addedGarage = await addCustomerGarage({
          customer_id: customerId,
          garage_code: normalizedCode,
          source,
        }).unwrap();

        const mergedPayload = mergeGaragePayload(
          {
            ...payload,
            garageCode: normalizedCode,
            resolved: true,
          },
          addedGarage,
        );

        console.log('[GarageSelection] syncGarageMembership api success', {
          addedGarage,
          mergedPayload,
        });

        return mergedPayload;
      } catch (error: any) {
        console.log('[GarageSelection] syncGarageMembership api error', {
          normalizedCode,
          source,
          error,
        });
        Alert.alert(
          'Không thể thêm gara',
          getApiErrorMessage(
            error,
            'Không thể liên kết gara vào tài khoản. Vui lòng thử lại sau.',
          ),
        );

        return null;
      }
    },
    [addCustomerGarage, isCustomerAccount, userId],
  );

  const addGarage = useCallback(
    async (garage: GarageInput, options?: AddGarageOptions) => {
      const payload = mapGarageInputToPayload(garage);
      console.log('[GarageSelection] addGarage start', {
        inputGarage: garage,
        mappedPayload: payload,
        options,
      });

      const syncedGarage = await syncGarageMembership(payload, options?.source || 'manual');

      if (!syncedGarage) {
        console.log('[GarageSelection] addGarage failed: syncedGarage is null');
        return false;
      }

      if (options?.activate) {
        dispatch(saveAndSetActiveGarage(syncedGarage));
        console.log('[GarageSelection] addGarage dispatched saveAndSetActiveGarage', syncedGarage);
      } else {
        dispatch(upsertSavedGarage(syncedGarage));
        console.log('[GarageSelection] addGarage dispatched upsertSavedGarage', syncedGarage);
      }

      return true;
    },
    [dispatch, syncGarageMembership],
  );

  const activateGarage = useCallback(
    async (garage: GarageInput, source: AddGarageOptions['source'] = 'tab') => {
      const payload = mapGarageInputToPayload(garage);
      const normalizedCode = normalizeGarageCode(payload.garageCode);

      console.log('[GarageSelection] activateGarage start', {
        inputGarage: garage,
        mappedPayload: payload,
        normalizedCode,
        currentGarageCode,
        garageResolved,
        source,
      });

      if (!normalizedCode) {
        console.log('[GarageSelection] activateGarage stop: empty normalizedCode');
        return false;
      }

      if (normalizedCode === currentGarageCode && garageResolved) {
        console.log('[GarageSelection] activateGarage skip: already active and resolved', {
          normalizedCode,
          currentGarageCode,
          garageResolved,
        });
        return true;
      }

      const syncedGarage = await syncGarageMembership(payload, source);

      if (!syncedGarage) {
        console.log('[GarageSelection] activateGarage failed: syncedGarage is null');
        return false;
      }

      dispatch(saveAndSetActiveGarage(syncedGarage));
      console.log('[GarageSelection] activateGarage dispatched saveAndSetActiveGarage', syncedGarage);
      return true;
    },
    [currentGarageCode, dispatch, garageResolved, syncGarageMembership],
  );

  return {
    addGarage,
    activateGarage,
    currentGarageCode,
    isCustomerAccount,
  };
};

export default useCustomerGarageSelection;
