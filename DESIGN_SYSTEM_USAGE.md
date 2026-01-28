# 🎨 Design System Usage Guide

Hướng dẫn sử dụng Design System và các components mới đã được tạo.

## 📦 Design System

### Spacing

```tsx
import { spacing, getSpacing } from '@/design-system';

// Sử dụng spacing constants
const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,        // 24px
    marginTop: spacing.base,     // 16px
    gap: spacing.md,             // 12px
  },
});

// Hoặc dùng helper function
const padding = getSpacing('lg'); // 20px
```

### Shadows

```tsx
import { getShadowStyle, getRedShadowStyle } from '@/design-system';

const styles = StyleSheet.create({
  card: {
    ...getShadowStyle('md'),     // Medium shadow (iOS + Android)
  },
  button: {
    ...getRedShadowStyle('lg'),  // Red shadow for primary buttons
  },
});
```

### Borders

```tsx
import { borderRadius, borderPresets } from '@/design-system';

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.xl,        // 16px
    // hoặc
    borderRadius: borderPresets.button, // Preset cho button
  },
});
```

### Typography

```tsx
import { TypographyUtils, textStyles } from '@/design-system';

const styles = StyleSheet.create({
  heading: {
    ...textStyles.h1,  // Heading 1 style
  },
  body: {
    ...textStyles.body, // Body text style
  },
});
```

## 🧩 UI Components

### Button

```tsx
import { Button } from '@/components/ui';

// Primary button (default)
<Button
  title="Tiếp tục"
  onPress={handlePress}
  variant="primary"
  size="medium"
  fullWidth
/>

// Secondary button
<Button
  title="Hủy"
  onPress={handleCancel}
  variant="secondary"
/>

// Outline button
<Button
  title="Xem thêm"
  onPress={handleViewMore}
  variant="outline"
/>

// Ghost button
<Button
  title="Bỏ qua"
  onPress={handleSkip}
  variant="ghost"
/>

// Button với loading
<Button
  title="Đang xử lý..."
  onPress={handleSubmit}
  loading={isLoading}
  disabled={isLoading}
/>
```

### Card

```tsx
import { Card } from '@/components/ui';

// Default card
<Card>
  <Text>Card content</Text>
</Card>

// Elevated card
<Card variant="elevated" padding="lg">
  <Text>Elevated card with more padding</Text>
</Card>

// Outlined card
<Card variant="outlined" borderRadius="xl">
  <Text>Outlined card</Text>
</Card>

// Custom card
<Card
  padding="xl"
  shadow="lg"
  borderRadius="2xl"
  backgroundColor={Colors.background.muted}
>
  <Text>Custom styled card</Text>
</Card>
```

### Badge

```tsx
import { Badge } from '@/components/ui';

// Status badges
<Badge text="Hoàn thành" variant="success" />
<Badge text="Lỗi" variant="error" />
<Badge text="Cảnh báo" variant="warning" />
<Badge text="Thông tin" variant="info" />

// Sizes
<Badge text="Small" variant="primary" size="small" />
<Badge text="Medium" variant="primary" size="medium" />
<Badge text="Large" variant="primary" size="large" />
```

### Divider

```tsx
import { Divider } from '@/components/ui';

// Horizontal divider
<Divider variant="horizontal" margin="lg" />

// Vertical divider
<View style={{ flexDirection: 'row', height: 40 }}>
  <Text>Left</Text>
  <Divider variant="vertical" margin="md" />
  <Text>Right</Text>
</View>

// Custom divider
<Divider
  color={Colors.border}
  thickness={2}
  margin="xl"
/>
```

## 📱 Screen Component

### Basic Screen

```tsx
import { Screen } from '@/components/layout';

function MyScreen() {
  return (
    <Screen
      headerTitle="Tiêu đề màn hình"
      showBackButton
      withScroll
      contentPadding="xl"
    >
      <Text>Screen content</Text>
    </Screen>
  );
}
```

### Screen với Custom Styling

```tsx
<Screen
  headerTitle="Đăng nhập"
  showBackButton={false}
  safeAreaTopColor={Colors.primary}
  contentPaddingCustom={{
    horizontal: 'xl',
    vertical: 'lg',
  }}
  statusBarStyle="light-content"
>
  <View>
    <Text>Login form</Text>
  </View>
</Screen>
```

### Screen không có Header

```tsx
<Screen
  hideHeader
  backgroundColor={Colors.background.muted}
  withScroll
>
  <Text>Full screen content</Text>
</Screen>
```

## 🔧 Platform Utilities

### Platform Detection

```tsx
import { isIOS, isAndroid, selectPlatform } from '@/utils/platform';

// Check platform
if (isIOS()) {
  // iOS specific code
}

// Select platform value
const padding = selectPlatform(16, 12); // 16 for iOS, 12 for Android
```

### Safe Area

```tsx
import { useSafeArea } from '@/utils/platform/safeArea';

function MyComponent() {
  const safeArea = useSafeArea({
    disableTop: false,
    disableBottom: true,
  });

  return (
    <View style={{ paddingTop: safeArea.top }}>
      <Text>Content</Text>
    </View>
  );
}
```

### Keyboard Handling

```tsx
import { useKeyboardAvoidance, useKeyboardEvents } from '@/utils/platform/keyboard';

// Keyboard avoidance
function MyForm() {
  const { translateY } = useKeyboardAvoidance({
    offset: 60,
    enabled: true,
  });

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <TextInput />
    </Animated.View>
  );
}

// Keyboard events
function MyScreen() {
  useKeyboardEvents({
    onShow: (height) => {
      console.log('Keyboard shown:', height);
    },
    onHide: () => {
      console.log('Keyboard hidden');
    },
  });

  return <View>...</View>;
}
```

## 📝 Migration Examples

### Before (Old Code)

```tsx
// ❌ Old way
const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
```

### After (New Code)

```tsx
// ✅ New way with design system
import { spacing, borderRadius, getShadowStyle } from '@/design-system';

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    ...getShadowStyle('md'),
  },
});
```

### Before (Platform-specific)

```tsx
// ❌ Old way
const padding = Platform.select({
  ios: 16,
  android: 12,
});
```

### After (Platform Utilities)

```tsx
// ✅ New way
import { selectPlatform } from '@/utils/platform';

const padding = selectPlatform(16, 12);
```

## 🎯 Best Practices

1. **Luôn sử dụng Design System**: Thay vì hardcode values, dùng spacing, borderRadius, shadows từ design system
2. **Sử dụng Components**: Dùng Button, Card, Badge thay vì tự tạo
3. **Platform Utilities**: Dùng `selectPlatform` thay vì `Platform.select` trực tiếp
4. **Screen Component**: Dùng Screen component cho tất cả screens để đảm bảo consistency
5. **Type Safety**: Tất cả components đều có TypeScript types, sử dụng để có autocomplete

## 📚 API Reference

Xem chi tiết API trong các file:
- `src/design-system/index.ts` - Design system exports
- `src/components/ui/` - UI components
- `src/components/layout/Screen/` - Screen component
- `src/utils/platform/` - Platform utilities

