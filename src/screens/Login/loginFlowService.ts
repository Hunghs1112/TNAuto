import { CommonActions } from "@react-navigation/native";

import { setLoggedIn } from "../../redux/slices/authSlice";
import { GaragePayload } from "../../redux/slices/garageContextSlice";
import { registerFCMTokenAfterLogin } from "../../utils/fcmTokenManager";

type UserType = "customer" | "dealer" | "employee" | "garage_manager" | "garage_admin";

export type LoginFlowFailure = {
  title: string;
  message: string;
  allowRegister?: boolean;
};

export type CompleteLoginFlowParams = {
  dispatch: (action: any) => void;
  navigation: { dispatch: (action: any) => void };
  authPayload: Parameters<typeof setLoggedIn>[0];
  userId: string;
  userType: UserType;
  resetRouteName: string;
  onBeforeReset?: () => void;
};

export type LoginFlowSummary = {
  userId: string;
  userType: UserType;
  resetRouteName: string;
};

export type CustomerLoginContent = {
  authPayload: Parameters<typeof setLoggedIn>[0];
  linkedGarages: GaragePayload[];
};

export type DealerLoginContent = {
  authPayload: Parameters<typeof setLoggedIn>[0];
  garageContext: GaragePayload;
};

export type ManagerLoginContent = {
  authPayload: Parameters<typeof setLoggedIn>[0];
  garageContext: GaragePayload;
};

export type LoginFlowState = {
  isReady: boolean;
};

export type LoginFlowActions = {
  complete: (params: Omit<CompleteLoginFlowParams, "userId" | "userType" | "resetRouteName" | "authPayload">) => void;
};

export type CustomerLoginContract = {
  summary: LoginFlowSummary;
  content: CustomerLoginContent;
  state: LoginFlowState;
  actions: LoginFlowActions;
};

export type DealerLoginContract = {
  summary: LoginFlowSummary;
  content: DealerLoginContent;
  state: LoginFlowState;
  actions: LoginFlowActions;
};

export type ManagerLoginContract = {
  summary: LoginFlowSummary;
  content: ManagerLoginContent;
  state: LoginFlowState;
  actions: LoginFlowActions;
};

export function completeLoginFlow({
  dispatch,
  navigation,
  authPayload,
  userId,
  userType,
  resetRouteName,
  onBeforeReset,
}: CompleteLoginFlowParams) {
  dispatch(setLoggedIn(authPayload));

  onBeforeReset?.();

  if (userType === "customer" || userType === "employee" || userType === "dealer") {
    registerFCMTokenAfterLogin(userId, userType).catch((error) => {
      console.error("Failed to register FCM token:", error);
    });
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: resetRouteName as never }],
    })
  );
}

export function createCustomerLoginContract(loginResult: any, normalizedPhone: string): CustomerLoginContract | null {
  if (!loginResult?.success || !loginResult?.customer) {
    return null;
  }

  const userId = String(loginResult.customer_id || loginResult.customer.id || "");

  const authPayload: Parameters<typeof setLoggedIn>[0] = {
    isLoggedIn: true,
    userType: "customer",
    userId,
    userName: loginResult.customer?.name || "Customer",
    userPhone: loginResult.customer?.phone || normalizedPhone,
    userLicensePlate: loginResult.customer?.license_plate || "",
    avatarUrl: loginResult.customer?.avatar_url || "",
    userEmail: loginResult.customer?.email || "",
    authMode: "identity_lookup",
  };

  const linkedGarages = (Array.isArray(loginResult.linked_garages) ? loginResult.linked_garages : []).map((garage: any) => ({
    garageId: garage.id,
    garageCode: garage.code,
    garageName: garage.name,
    address: garage.address,
    avatarUrl: garage.avatar_url,
    bannerUrl: garage.banner_url,
    status: garage.status,
    resolved: true,
  }));

  const summary: LoginFlowSummary = {
    userId,
    userType: "customer",
    resetRouteName: linkedGarages.length > 0 ? "Home" : "SelectGarage",
  };

  return {
    summary,
    content: {
      authPayload,
      linkedGarages,
    },
    state: {
      isReady: true,
    },
    actions: {
      complete: ({ dispatch, navigation, onBeforeReset }) =>
        completeLoginFlow({
          dispatch,
          navigation,
          onBeforeReset,
          authPayload,
          userId: summary.userId,
          userType: summary.userType,
          resetRouteName: summary.resetRouteName,
        }),
    },
  };
}

export function createDealerLoginContract(result: any, inputGarageCode: string): DealerLoginContract | null {
  const dealer = result?.dealer || result?.data;

  if (!result?.success || !dealer) {
    return null;
  }

  const userId = String(result.dealer_id || dealer.id || "");

  const authPayload: Parameters<typeof setLoggedIn>[0] = {
    isLoggedIn: true,
    userType: "dealer",
    userId,
    userName: dealer.name || "Dealer",
    userPhone: dealer.phone || "",
    userLicensePlate: "",
    avatarUrl: dealer.avatar_url || "",
    userEmail: dealer.email || "",
    token: result.token || "",
    expiresAt: result.expires_at || "",
  };

  const garageContext: GaragePayload = {
    garageId: result.garage?.id ?? result.garage_id,
    garageCode: result.garage?.code || inputGarageCode,
    garageName: result.garage?.name,
    address: result.garage?.address,
    avatarUrl: result.garage?.avatar_url,
    bannerUrl: result.garage?.banner_url,
    status: result.garage?.status,
    resolved: true,
  };

  const summary: LoginFlowSummary = {
    userId,
    userType: "dealer",
    resetRouteName: "Home",
  };

  return {
    summary,
    content: {
      authPayload,
      garageContext,
    },
    state: {
      isReady: true,
    },
    actions: {
      complete: ({ dispatch, navigation, onBeforeReset }) =>
        completeLoginFlow({
          dispatch,
          navigation,
          onBeforeReset,
          authPayload,
          userId: summary.userId,
          userType: summary.userType,
          resetRouteName: summary.resetRouteName,
        }),
    },
  };
}

export function createManagerLoginContract(
  result: any,
  inputLogin: string,
  fallbackRole: "garage_manager" | "garage_admin" = "garage_manager"
): ManagerLoginContract | null {
  const resolvedRole = result?.data?.user_type || fallbackRole;
  if (!result?.success || (resolvedRole !== "garage_manager" && resolvedRole !== "garage_admin")) {
    return null;
  }

  const userId = String(result.garage_manager_id || result?.data?.garage_manager_id || "");
  const authPayload: Parameters<typeof setLoggedIn>[0] = {
    isLoggedIn: true,
    userType: resolvedRole,
    userId,
    userName: result?.data?.name || result?.garage?.name || "Garage Manager",
    userPhone: inputLogin,
    userLicensePlate: "",
    avatarUrl: result?.garage?.avatar_url || "",
    userEmail: result?.data?.email || "",
    token: result.token || "",
    expiresAt: result.expires_at || "",
  };

  const garageContext: GaragePayload = {
    garageId: result.garage?.id ?? result?.data?.garage_id,
    garageCode: result.garage?.code,
    garageName: result.garage?.name,
    address: result.garage?.address,
    avatarUrl: result.garage?.avatar_url,
    bannerUrl: result.garage?.banner_url,
    status: result.garage?.status,
    resolved: true,
  };

  const summary: LoginFlowSummary = {
    userId,
    userType: resolvedRole,
    resetRouteName: "Home",
  };

  return {
    summary,
    content: {
      authPayload,
      garageContext,
    },
    state: {
      isReady: true,
    },
    actions: {
      complete: ({ dispatch, navigation, onBeforeReset }) =>
        completeLoginFlow({
          dispatch,
          navigation,
          onBeforeReset,
          authPayload,
          userId: summary.userId,
          userType: summary.userType,
          resetRouteName: summary.resetRouteName,
        }),
    },
  };
}

export function mapCustomerLoginFailure(error: any): LoginFlowFailure {
  const backendMessage = error?.data?.error || error?.data?.message || error?.error;

  return {
    title: "Đăng nhập thất bại",
    message:
      backendMessage ||
      "Không thể đăng nhập. Vui lòng kiểm tra số điện thoại hoặc thử lại.",
    allowRegister: true,
  };
}

export function mapDealerLoginFailure(error: any): LoginFlowFailure {
  const backendMessage = error?.data?.error || error?.data?.message || error?.error;

  if (error?.status === 403) {
    return {
      title: "Gara tam ngung hoat dong",
      message: backendMessage || "Gara cua tai khoan dai ly dang khong o trang thai active.",
    };
  }

  if (error?.status === 401) {
    return {
      title: "Sai thong tin dang nhap",
      message: backendMessage || "So dien thoai hoac mat khau khong dung.",
    };
  }

  if (error?.status === 400) {
    return {
      title: "Thieu thong tin dang nhap",
      message: backendMessage || "Can garage_code, phone va password.",
    };
  }

  return {
    title: "Loi",
    message: backendMessage || "Khong the ket noi den may chu. Vui long thu lai sau.",
  };
}

export function mapManagerLoginFailure(error: any): LoginFlowFailure {
  const backendMessage = error?.data?.error || error?.data?.message || error?.error;

  if (error?.status === 403) {
    return {
      title: "Gara tam ngung hoat dong",
      message: backendMessage || "Gara cua tai khoan manager/admin dang khong o trang thai active.",
    };
  }

  if (error?.status === 401) {
    return {
      title: "Sai thong tin dang nhap",
      message: backendMessage || "So dien thoai hoac mat khau khong dung.",
    };
  }

  if (error?.status === 400) {
    return {
      title: "Thieu thong tin dang nhap",
      message: backendMessage || "Can login va password.",
    };
  }

  return {
    title: "Loi",
    message: backendMessage || "Khong the ket noi den may chu. Vui long thu lai sau.",
  };
}

