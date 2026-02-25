import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FirebaseMessaging
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Configure Firebase
    FirebaseApp.configure()
    
    // Set Firebase Messaging delegate
    Messaging.messaging().delegate = self
    
    // Request notification permissions
    UNUserNotificationCenter.current().delegate = self
    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(
      options: authOptions,
      completionHandler: { granted, error in
        if let error = error {
          print("❌ AppDelegate: Notification permission error: \(error)")
        } else {
          print("✅ AppDelegate: Notification permission granted: \(granted)")
        }
      }
    )
    
    // Register for remote notifications
    application.registerForRemoteNotifications()
    
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
    
    reactNativeDelegate = delegate
    reactNativeFactory = factory
    
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(withModuleName: "TNAuto", in: window, launchOptions: launchOptions)

    return true
  }
  
  // MARK: - Remote Notification Registration
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    // Forward device token to Firebase Messaging - QUAN TRỌNG cho push notification
    Messaging.messaging().apnsToken = deviceToken
    print("✅ AppDelegate: Device token registered and forwarded to Firebase Messaging")
  }
  
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("❌ AppDelegate: Failed to register for remote notifications: \(error)")
  }
  
  // MARK: - MessagingDelegate
  // Handle FCM token refresh
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("🔄 AppDelegate: FCM registration token refreshed: \(fcmToken ?? "nil")")
    // Token sẽ được xử lý bởi React Native Firebase module
    // FCMService sẽ tự động register token với backend
  }
  
  // MARK: - UNUserNotificationCenterDelegate
  // Handle notification when app is in foreground
  // This allows notifications to be shown even when app is open
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    let userInfo = notification.request.content.userInfo
    print("📱 AppDelegate: Notification received in foreground: \(userInfo)")
    
    // Show notification even when app is in foreground
    // Options: .banner, .sound, .badge, .list, .alert
    if #available(iOS 14.0, *) {
      completionHandler([.banner, .sound, .badge, .list])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }
  
  // Handle notification tap (when user taps notification)
  // This is called when:
  // 1. App is in background and user taps notification
  // 2. App is terminated and user taps notification (will also trigger getInitialNotification in JS)
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let userInfo = response.notification.request.content.userInfo
    print("👆 AppDelegate: User tapped notification: \(userInfo)")
    
    // The notification data will be handled by React Native Firebase
    // onNotificationOpenedApp or getInitialNotification will be called in JS
    completionHandler()
  }
  
  // Handle notification when app is launched from terminated state
  // This is called when app is completely closed and user taps notification
  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    print("🔵 AppDelegate: Received remote notification in background: \(userInfo)")
    
    // Let React Native Firebase handle this
    // Background handler in index.js will process this
    completionHandler(.newData)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
