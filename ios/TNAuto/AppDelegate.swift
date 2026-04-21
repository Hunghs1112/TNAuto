import UIKit
import QuartzCore
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
  private var animatedSplashView: AnimatedSplashView?
  private var splashObserver: NSObjectProtocol?
  private var splashFallbackWorkItem: DispatchWorkItem?
  private var splashHideWorkItem: DispatchWorkItem?
  private var splashShownAt: CFTimeInterval = 0
  private var hasScheduledSplashDismissal = false
  private let splashMinimumVisibleDuration: TimeInterval = 1.2
  private let splashFallbackDuration: TimeInterval = 3.5

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
    factory.startReactNative(withModuleName: "GaraOne", in: window, launchOptions: launchOptions)
    showAnimatedSplash()

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

  private func showAnimatedSplash() {
    guard let window else { return }

    removeSplashObserver()
    splashFallbackWorkItem?.cancel()
    splashHideWorkItem?.cancel()
    hasScheduledSplashDismissal = false
    splashShownAt = CACurrentMediaTime()

    let splashView = AnimatedSplashView(frame: window.bounds)
    splashView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    animatedSplashView = splashView

    window.addSubview(splashView)
    window.bringSubviewToFront(splashView)
    splashView.playIntroAnimation()

    splashObserver = NotificationCenter.default.addObserver(
      forName: Notification.Name("RCTContentDidAppearNotification"),
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.scheduleSplashDismissal()
    }

    let fallbackWorkItem = DispatchWorkItem { [weak self] in
      self?.scheduleSplashDismissal()
    }
    splashFallbackWorkItem = fallbackWorkItem

    DispatchQueue.main.asyncAfter(
      deadline: .now() + splashFallbackDuration,
      execute: fallbackWorkItem
    )
  }

  private func scheduleSplashDismissal() {
    guard !hasScheduledSplashDismissal else { return }

    hasScheduledSplashDismissal = true
    splashFallbackWorkItem?.cancel()

    let elapsed = CACurrentMediaTime() - splashShownAt
    let delay = max(0, splashMinimumVisibleDuration - elapsed)
    let hideWorkItem = DispatchWorkItem { [weak self] in
      self?.dismissAnimatedSplash()
    }
    splashHideWorkItem = hideWorkItem

    DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: hideWorkItem)
  }

  private func dismissAnimatedSplash() {
    splashFallbackWorkItem?.cancel()
    splashHideWorkItem?.cancel()
    removeSplashObserver()

    guard let splashView = animatedSplashView else { return }

    splashView.performExitAnimation { [weak self, weak splashView] in
      splashView?.removeFromSuperview()
      self?.animatedSplashView = nil
    }
  }

  private func removeSplashObserver() {
    if let splashObserver {
      NotificationCenter.default.removeObserver(splashObserver)
      self.splashObserver = nil
    }
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

private final class AnimatedSplashView: UIView {
  private enum Palette {
    static let background = UIColor(red: 10.0 / 255.0, green: 18.0 / 255.0, blue: 34.0 / 255.0, alpha: 1)
    static let accent = UIColor(red: 84.0 / 255.0, green: 160.0 / 255.0, blue: 255.0 / 255.0, alpha: 1)
    static let accentSecondary = UIColor(red: 245.0 / 255.0, green: 158.0 / 255.0, blue: 11.0 / 255.0, alpha: 1)
    static let title = UIColor.white
    static let subtitle = UIColor(red: 167.0 / 255.0, green: 183.0 / 255.0, blue: 204.0 / 255.0, alpha: 1)
    static let panel = UIColor.white.withAlphaComponent(0.08)
    static let panelBorder = UIColor.white.withAlphaComponent(0.12)
  }

  private let leadingGlowView = UIView()
  private let trailingGlowView = UIView()
  private let logoContainerView = UIView()
  private let logoImageView = UIImageView()
  private let titleLabel = UILabel()
  private let subtitleLabel = UILabel()
  private let dotsStackView = UIStackView()
  private let ringLayer = CAShapeLayer()
  private var dotViews: [UIView] = []

  override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()

    leadingGlowView.layer.cornerRadius = leadingGlowView.bounds.height / 2
    trailingGlowView.layer.cornerRadius = trailingGlowView.bounds.height / 2
    logoContainerView.layer.cornerRadius = 48

    ringLayer.frame = logoContainerView.bounds.insetBy(dx: 10, dy: 10)
    ringLayer.path = UIBezierPath(
      roundedRect: ringLayer.bounds,
      cornerRadius: 38
    ).cgPath
  }

  func playIntroAnimation() {
    logoContainerView.alpha = 0
    logoContainerView.transform = CGAffineTransform(scaleX: 0.82, y: 0.82)
    titleLabel.alpha = 0
    titleLabel.transform = CGAffineTransform(translationX: 0, y: 14)
    subtitleLabel.alpha = 0
    subtitleLabel.transform = CGAffineTransform(translationX: 0, y: 14)
    dotsStackView.alpha = 0
    dotsStackView.transform = CGAffineTransform(translationX: 0, y: 10)
    leadingGlowView.alpha = 0.35
    leadingGlowView.transform = CGAffineTransform(scaleX: 0.86, y: 0.86)
    trailingGlowView.alpha = 0.2
    trailingGlowView.transform = CGAffineTransform(scaleX: 1.12, y: 1.12)
    ringLayer.strokeEnd = 0

    UIView.animate(
      withDuration: 0.95,
      delay: 0,
      usingSpringWithDamping: 0.78,
      initialSpringVelocity: 0.55,
      options: [.curveEaseOut]
    ) {
      self.logoContainerView.alpha = 1
      self.logoContainerView.transform = .identity
    }

    UIView.animate(withDuration: 0.55, delay: 0.1, options: [.curveEaseOut]) {
      self.leadingGlowView.alpha = 1
      self.leadingGlowView.transform = .identity
      self.trailingGlowView.alpha = 1
      self.trailingGlowView.transform = .identity
    }

    UIView.animate(withDuration: 0.6, delay: 0.2, options: [.curveEaseOut]) {
      self.titleLabel.alpha = 1
      self.titleLabel.transform = .identity
    }

    UIView.animate(withDuration: 0.6, delay: 0.28, options: [.curveEaseOut]) {
      self.subtitleLabel.alpha = 1
      self.subtitleLabel.transform = .identity
    }

    UIView.animate(withDuration: 0.45, delay: 0.38, options: [.curveEaseOut]) {
      self.dotsStackView.alpha = 1
      self.dotsStackView.transform = .identity
    }

    let ringAnimation = CABasicAnimation(keyPath: "strokeEnd")
    ringAnimation.fromValue = 0
    ringAnimation.toValue = 1
    ringAnimation.duration = 0.95
    ringAnimation.timingFunction = CAMediaTimingFunction(name: .easeOut)
    ringLayer.strokeEnd = 1
    ringLayer.add(ringAnimation, forKey: "ringIntro")

    startAmbientAnimations()
  }

  func performExitAnimation(completion: @escaping () -> Void) {
    layer.removeAllAnimations()
    logoContainerView.layer.removeAllAnimations()
    leadingGlowView.layer.removeAllAnimations()
    trailingGlowView.layer.removeAllAnimations()
    dotViews.forEach { $0.layer.removeAllAnimations() }

    UIView.animate(withDuration: 0.45, delay: 0, options: [.curveEaseInOut]) {
      self.alpha = 0
      self.logoContainerView.transform = CGAffineTransform(scaleX: 1.08, y: 1.08)
      self.titleLabel.transform = CGAffineTransform(translationX: 0, y: -10)
      self.subtitleLabel.transform = CGAffineTransform(translationX: 0, y: -10)
      self.dotsStackView.transform = CGAffineTransform(translationX: 0, y: -8)
      self.leadingGlowView.transform = CGAffineTransform(scaleX: 1.12, y: 1.12)
      self.trailingGlowView.transform = CGAffineTransform(scaleX: 0.92, y: 0.92)
    } completion: { _ in
      completion()
    }
  }

  private func setupView() {
    backgroundColor = Palette.background
    isOpaque = true
    isUserInteractionEnabled = false

    setupGlowViews()
    setupLogoContainerView()
    setupLabels()
    setupDots()
    setupConstraints()
  }

  private func setupGlowViews() {
    leadingGlowView.translatesAutoresizingMaskIntoConstraints = false
    leadingGlowView.backgroundColor = Palette.accent.withAlphaComponent(0.2)
    addSubview(leadingGlowView)

    trailingGlowView.translatesAutoresizingMaskIntoConstraints = false
    trailingGlowView.backgroundColor = Palette.accentSecondary.withAlphaComponent(0.18)
    addSubview(trailingGlowView)
  }

  private func setupLogoContainerView() {
    logoContainerView.translatesAutoresizingMaskIntoConstraints = false
    logoContainerView.backgroundColor = Palette.panel
    logoContainerView.layer.borderWidth = 1
    logoContainerView.layer.borderColor = Palette.panelBorder.cgColor
    logoContainerView.layer.shadowColor = Palette.accent.cgColor
    logoContainerView.layer.shadowOpacity = 0.22
    logoContainerView.layer.shadowRadius = 28
    logoContainerView.layer.shadowOffset = CGSize(width: 0, height: 12)
    addSubview(logoContainerView)

    ringLayer.fillColor = UIColor.clear.cgColor
    ringLayer.strokeColor = UIColor.white.withAlphaComponent(0.18).cgColor
    ringLayer.lineWidth = 1.5
    logoContainerView.layer.addSublayer(ringLayer)

    logoImageView.translatesAutoresizingMaskIntoConstraints = false
    logoImageView.contentMode = .scaleAspectFit
    logoImageView.image = UIImage(named: "LaunchLogo") ?? UIImage(systemName: "car.2.fill")
    logoContainerView.addSubview(logoImageView)

    NSLayoutConstraint.activate([
      logoImageView.centerXAnchor.constraint(equalTo: logoContainerView.centerXAnchor),
      logoImageView.centerYAnchor.constraint(equalTo: logoContainerView.centerYAnchor),
      logoImageView.widthAnchor.constraint(equalToConstant: 108),
      logoImageView.heightAnchor.constraint(equalTo: logoImageView.widthAnchor)
    ])
  }

  private func setupLabels() {
    titleLabel.translatesAutoresizingMaskIntoConstraints = false
    titleLabel.text = "GaraOne"
    titleLabel.font = .systemFont(ofSize: 34, weight: .bold)
    titleLabel.textColor = Palette.title
    titleLabel.textAlignment = .center
    addSubview(titleLabel)

    subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
    subtitleLabel.text = "Quản lí ô tô"
    subtitleLabel.font = .systemFont(ofSize: 15, weight: .medium)
    subtitleLabel.textColor = Palette.subtitle
    subtitleLabel.textAlignment = .center
    subtitleLabel.numberOfLines = 1
    addSubview(subtitleLabel)
  }

  private func setupDots() {
    dotsStackView.translatesAutoresizingMaskIntoConstraints = false
    dotsStackView.axis = .horizontal
    dotsStackView.alignment = .center
    dotsStackView.distribution = .fillEqually
    dotsStackView.spacing = 10
    addSubview(dotsStackView)

    for _ in 0..<3 {
      let dotView = UIView()
      dotView.translatesAutoresizingMaskIntoConstraints = false
      dotView.backgroundColor = UIColor.white.withAlphaComponent(0.78)
      dotView.layer.cornerRadius = 4
      dotsStackView.addArrangedSubview(dotView)
      dotViews.append(dotView)

      NSLayoutConstraint.activate([
        dotView.widthAnchor.constraint(equalToConstant: 8),
        dotView.heightAnchor.constraint(equalToConstant: 8)
      ])
    }
  }

  private func setupConstraints() {
    NSLayoutConstraint.activate([
      leadingGlowView.widthAnchor.constraint(equalToConstant: 300),
      leadingGlowView.heightAnchor.constraint(equalTo: leadingGlowView.widthAnchor),
      leadingGlowView.topAnchor.constraint(equalTo: topAnchor, constant: -88),
      leadingGlowView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: 112),

      trailingGlowView.widthAnchor.constraint(equalToConstant: 220),
      trailingGlowView.heightAnchor.constraint(equalTo: trailingGlowView.widthAnchor),
      trailingGlowView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: -76),
      trailingGlowView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -164),

      logoContainerView.centerXAnchor.constraint(equalTo: centerXAnchor),
      logoContainerView.centerYAnchor.constraint(equalTo: centerYAnchor, constant: -28),
      logoContainerView.widthAnchor.constraint(equalToConstant: 176),
      logoContainerView.heightAnchor.constraint(equalTo: logoContainerView.widthAnchor),

      titleLabel.topAnchor.constraint(equalTo: logoContainerView.bottomAnchor, constant: 24),
      titleLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 32),
      titleLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -32),

      subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 10),
      subtitleLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 32),
      subtitleLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -32),

      dotsStackView.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 24),
      dotsStackView.centerXAnchor.constraint(equalTo: centerXAnchor)
    ])
  }

  private func startAmbientAnimations() {
    let containerPulse = CABasicAnimation(keyPath: "transform.scale")
    containerPulse.fromValue = 1
    containerPulse.toValue = 1.03
    containerPulse.duration = 1.4
    containerPulse.autoreverses = true
    containerPulse.repeatCount = .infinity
    containerPulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
    logoContainerView.layer.add(containerPulse, forKey: "containerPulse")

    let leadingGlowPulse = CABasicAnimation(keyPath: "transform.scale")
    leadingGlowPulse.fromValue = 0.96
    leadingGlowPulse.toValue = 1.08
    leadingGlowPulse.duration = 2.8
    leadingGlowPulse.autoreverses = true
    leadingGlowPulse.repeatCount = .infinity
    leadingGlowPulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
    leadingGlowView.layer.add(leadingGlowPulse, forKey: "leadingGlowPulse")

    let trailingGlowPulse = CABasicAnimation(keyPath: "transform.scale")
    trailingGlowPulse.fromValue = 1.04
    trailingGlowPulse.toValue = 0.92
    trailingGlowPulse.duration = 3
    trailingGlowPulse.autoreverses = true
    trailingGlowPulse.repeatCount = .infinity
    trailingGlowPulse.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
    trailingGlowView.layer.add(trailingGlowPulse, forKey: "trailingGlowPulse")

    for (index, dotView) in dotViews.enumerated() {
      let opacityAnimation = CABasicAnimation(keyPath: "opacity")
      opacityAnimation.fromValue = 0.28
      opacityAnimation.toValue = 1
      opacityAnimation.duration = 0.55
      opacityAnimation.beginTime = CACurrentMediaTime() + (Double(index) * 0.12)
      opacityAnimation.autoreverses = true
      opacityAnimation.repeatCount = .infinity
      opacityAnimation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
      dotView.layer.add(opacityAnimation, forKey: "dotOpacity")

      let scaleAnimation = CABasicAnimation(keyPath: "transform.scale")
      scaleAnimation.fromValue = 0.88
      scaleAnimation.toValue = 1.16
      scaleAnimation.duration = 0.55
      scaleAnimation.beginTime = CACurrentMediaTime() + (Double(index) * 0.12)
      scaleAnimation.autoreverses = true
      scaleAnimation.repeatCount = .infinity
      scaleAnimation.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
      dotView.layer.add(scaleAnimation, forKey: "dotScale")
    }
  }
}
