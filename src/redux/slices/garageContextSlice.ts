import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SavedGarage {
  garageId: string;
  garageCode: string;
  garageName: string;
  address: string;
  avatarUrl: string;
  bannerUrl: string;
  status: string;
  isLocked: boolean;
  lockReason: string;
}

export interface GarageContextState {
  garageId: string;
  garageCode: string;
  activeGarageCode: string;
  garageName: string;
  address: string;
  avatarUrl: string;
  bannerUrl: string;
  status: string;
  resolved: boolean;
  savedGarages: SavedGarage[];
}

export interface GaragePayload {
  garageId?: string | number | null;
  garageCode?: string | null;
  garageName?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  status?: string | null;
  resolved?: boolean;
  isLocked?: boolean;
  lockReason?: string | null;
}

const EMPTY_GARAGE_CONTEXT: GarageContextState = {
  garageId: '',
  garageCode: '',
  activeGarageCode: '',
  garageName: '',
  address: '',
  avatarUrl: '',
  bannerUrl: '',
  status: '',
  resolved: false,
  savedGarages: [],
};

const normalizeGarageCode = (value?: string | null) => value?.trim().toUpperCase() || '';

// NOTE:
// Previously we treated "DEFAULT" as a legacy placeholder and filtered it out.
// New backend contract can return real garage code "DEFAULT", so we must accept it.
const isLegacyDefaultGarage = (_garageCode?: string, _garageName?: string | null) => false;

const buildSavedGarage = (payload: GaragePayload, existing?: SavedGarage): SavedGarage | null => {
  const garageCode = normalizeGarageCode(payload.garageCode || existing?.garageCode || '');

  if (!garageCode || isLegacyDefaultGarage(garageCode, payload.garageName || existing?.garageName)) {
    return null;
  }

  return {
    garageId: payload.garageId !== undefined && payload.garageId !== null
      ? String(payload.garageId)
      : existing?.garageId || '',
    garageCode,
    garageName: payload.garageName?.trim() || existing?.garageName || garageCode,
    address: payload.address || existing?.address || '',
    avatarUrl: payload.avatarUrl || existing?.avatarUrl || '',
    bannerUrl: payload.bannerUrl || existing?.bannerUrl || '',
    status: payload.status || existing?.status || '',
    isLocked: payload.isLocked ?? existing?.isLocked ?? false,
    lockReason: payload.lockReason || existing?.lockReason || '',
  };
};

const setActiveGarageState = (state: GarageContextState, payload: GaragePayload) => {
  const normalizedCode = normalizeGarageCode(payload.garageCode);

  if (!normalizedCode || isLegacyDefaultGarage(normalizedCode, payload.garageName)) {
    state.garageId = '';
    state.garageCode = '';
    state.activeGarageCode = '';
    state.garageName = '';
    state.address = '';
    state.avatarUrl = '';
    state.bannerUrl = '';
    state.status = '';
    state.resolved = false;
    return;
  }

  state.garageId = payload.garageId ? String(payload.garageId) : '';
  state.garageCode = normalizedCode;
  state.activeGarageCode = normalizedCode;
  state.garageName = payload.garageName || normalizedCode;
  state.address = payload.address || '';
  state.avatarUrl = payload.avatarUrl || '';
  state.bannerUrl = payload.bannerUrl || '';
  state.status = payload.status || '';
  state.resolved = payload.resolved ?? true;
};

const syncSavedGarageDetails = (state: GarageContextState, payload: GaragePayload) => {
  const garageCode = normalizeGarageCode(payload.garageCode);

  if (!garageCode) {
    return;
  }

  const existingIndex = state.savedGarages.findIndex((garage) => garage.garageCode === garageCode);

  if (existingIndex === -1) {
    return;
  }

  const updatedGarage = buildSavedGarage(payload, state.savedGarages[existingIndex]);
  if (updatedGarage) {
    state.savedGarages[existingIndex] = updatedGarage;
  }
};

const upsertSavedGarageState = (state: GarageContextState, payload: GaragePayload) => {
  const garageCode = normalizeGarageCode(payload.garageCode);

  if (!garageCode) {
    return null;
  }

  // Tìm theo garageCode trước (exact match)
  let existingIndex = state.savedGarages.findIndex((garage) => garage.garageCode === garageCode);

  // Nếu không tìm thấy theo code, tìm theo garageId (trường hợp admin đổi mã gara)
  // Điều này ngăn tạo entry trùng khi cùng 1 gara có mã mới
  if (existingIndex === -1 && payload.garageId) {
    const normalizedId = String(payload.garageId);
    existingIndex = state.savedGarages.findIndex(
      (garage) => garage.garageId && String(garage.garageId) === normalizedId,
    );
  }

  const updatedGarage = buildSavedGarage(
    payload,
    existingIndex >= 0 ? state.savedGarages[existingIndex] : undefined,
  );

  if (!updatedGarage) {
    return null;
  }

  if (existingIndex >= 0) {
    state.savedGarages[existingIndex] = updatedGarage;
  } else {
    state.savedGarages.push(updatedGarage);
  }

  return updatedGarage;
};

export const sanitizeGarageContextState = (state: Partial<GarageContextState> | null | undefined): GarageContextState => {
  const garageCode = normalizeGarageCode(state?.activeGarageCode || state?.garageCode);
  const garageName = state?.garageName || '';

  const savedGarages = Array.isArray(state?.savedGarages)
    ? state.savedGarages
        .map((garage) =>
          buildSavedGarage({
            garageId: garage.garageId,
            garageCode: garage.garageCode,
            garageName: garage.garageName,
            address: garage.address,
            avatarUrl: garage.avatarUrl,
            bannerUrl: garage.bannerUrl,
            status: garage.status,
            isLocked: garage.isLocked,
            lockReason: garage.lockReason,
          }),
        )
        .filter((garage): garage is SavedGarage => Boolean(garage))
        // Deduplicate theo garageId — giữ entry cuối cùng (mới nhất)
        .reduce<SavedGarage[]>((acc, garage) => {
          if (garage.garageId) {
            const dupIndex = acc.findIndex(
              (g) => g.garageId && String(g.garageId) === String(garage.garageId),
            );
            if (dupIndex >= 0) {
              acc[dupIndex] = garage; // cập nhật entry cũ bằng entry mới hơn
              return acc;
            }
          }
          acc.push(garage);
          return acc;
        }, [])
    : [];

  const activeGarage =
    savedGarages.find((garage) => garage.garageCode === garageCode) ||
    buildSavedGarage({
      garageId: state?.garageId,
      garageCode,
      garageName,
      address: state?.address,
      avatarUrl: state?.avatarUrl,
      bannerUrl: state?.bannerUrl,
      status: state?.status,
    });

  if (!activeGarage) {
    return {
      ...EMPTY_GARAGE_CONTEXT,
      savedGarages,
    };
  }

  const hasActiveInSaved = savedGarages.some((garage) => garage.garageCode === activeGarage.garageCode);

  return {
    garageId: activeGarage.garageId,
    garageCode: activeGarage.garageCode,
    activeGarageCode: activeGarage.garageCode,
    garageName: activeGarage.garageName,
    address: activeGarage.address,
    avatarUrl: activeGarage.avatarUrl,
    bannerUrl: activeGarage.bannerUrl,
    status: activeGarage.status,
    resolved: Boolean(activeGarage.garageCode),
    savedGarages: hasActiveInSaved ? savedGarages : [...savedGarages, activeGarage],
  };
};

const garageContextSlice = createSlice({
  name: 'garageContext',
  initialState: EMPTY_GARAGE_CONTEXT,
  reducers: {
    setGarageContext: (state, action: PayloadAction<GaragePayload>) => {
      setActiveGarageState(state, action.payload);
      syncSavedGarageDetails(state, action.payload);
    },
    upsertSavedGarage: (state, action: PayloadAction<GaragePayload>) => {
      upsertSavedGarageState(state, action.payload);
    },
    saveAndSetActiveGarage: (state, action: PayloadAction<GaragePayload>) => {
      const savedGarage = upsertSavedGarageState(state, action.payload);

      if (savedGarage) {
        setActiveGarageState(state, {
          garageId: savedGarage.garageId,
          garageCode: savedGarage.garageCode,
          garageName: savedGarage.garageName,
          address: savedGarage.address,
          avatarUrl: savedGarage.avatarUrl,
          bannerUrl: savedGarage.bannerUrl,
          status: savedGarage.status,
          resolved: true,
        });
      }
    },
    setActiveGarageByCode: (state, action: PayloadAction<string>) => {
      const garageCode = normalizeGarageCode(action.payload);
      const savedGarage = state.savedGarages.find((garage) => garage.garageCode === garageCode);

      if (!savedGarage) {
        return;
      }

      setActiveGarageState(state, {
        garageId: savedGarage.garageId,
        garageCode: savedGarage.garageCode,
        garageName: savedGarage.garageName,
        address: savedGarage.address,
        avatarUrl: savedGarage.avatarUrl,
        bannerUrl: savedGarage.bannerUrl,
        status: savedGarage.status,
        resolved: true,
      });
    },
    clearGarageContext: (state) => {
      state.garageId = '';
      state.garageCode = '';
      state.activeGarageCode = '';
      state.garageName = '';
      state.address = '';
      state.avatarUrl = '';
      state.bannerUrl = '';
      state.status = '';
      state.resolved = false;
      state.savedGarages = [];
    },
    removeSavedGarage: (state, action: PayloadAction<string>) => {
      const garageCode = normalizeGarageCode(action.payload);
      const garage = state.savedGarages.find((item) => item.garageCode === garageCode);

      if (!garage || garage.isLocked) {
        return;
      }

      state.savedGarages = state.savedGarages.filter((item) => item.garageCode !== garageCode);

      if (state.activeGarageCode === garageCode) {
        const nextGarage = state.savedGarages[0];

        if (nextGarage) {
          setActiveGarageState(state, {
            garageId: nextGarage.garageId,
            garageCode: nextGarage.garageCode,
            garageName: nextGarage.garageName,
            address: nextGarage.address,
            avatarUrl: nextGarage.avatarUrl,
            bannerUrl: nextGarage.bannerUrl,
            status: nextGarage.status,
            resolved: true,
          });
        } else {
          state.garageId = '';
          state.garageCode = '';
          state.activeGarageCode = '';
          state.garageName = '';
          state.address = '';
          state.avatarUrl = '';
          state.bannerUrl = '';
          state.status = '';
          state.resolved = false;
        }
      }
    },
  },
});

export const {
  setGarageContext,
  upsertSavedGarage,
  saveAndSetActiveGarage,
  setActiveGarageByCode,
  clearGarageContext,
  removeSavedGarage,
} = garageContextSlice.actions;

export default garageContextSlice.reducer;
