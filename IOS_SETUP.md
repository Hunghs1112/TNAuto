# iOS Setup - TNAuto (Cơ Bản)

## Chạy App iOS

### 1. Cài đặt dependencies
```bash
# Install Node modules
npm install

# Install iOS pods
cd ios
pod install
cd ..
```

### 2. Chạy app
```bash
# Start Metro bundler
npm start

# Trong terminal khác, chạy iOS
npm run ios
```

### 3. Chạy từ Xcode
```bash
# Mở workspace (KHÔNG mở .xcodeproj)
open ios/TNAuto.xcworkspace

# Trong Xcode:
# - Chọn simulator hoặc device
# - Nhấn ▶️ Play hoặc Cmd + R
```

## Troubleshooting

### Lỗi build
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm start -- --reset-cache
```

### Clean Xcode cache
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

---

✅ Đã restore về cấu hình React Native cơ bản (không Firebase)

