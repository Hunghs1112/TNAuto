// src/config/performance.ts
// Performance optimization configurations for React Native

export const PerformanceConfig = {
  // FlatList optimizations
  flatList: {
    initialNumToRender: 5,
    maxToRenderPerBatch: 5,
    windowSize: 5,
    removeClippedSubviews: true,
    updateCellsBatchingPeriod: 50,
    getItemLayout: (itemHeight: number) => (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
  },

  // Image optimizations
  image: {
    fadeDuration: 200,
    resizeMode: 'cover' as const,
    resizeMethod: 'resize' as const,
  },

  // Animation optimizations
  animation: {
    useNativeDriver: true,
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
  },

  // Debounce/Throttle timings
  timing: {
    debounce: 300,
    throttle: 100,
  },
};

// Disable console.logs in production
if (__DEV__ === false) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  console.warn = () => {};
}

