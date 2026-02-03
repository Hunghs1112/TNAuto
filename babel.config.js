module.exports = function (api) {
  api.cache(true);

  const presets = [
    // Default React-Native preset
    '@react-native/babel-preset',
  ];

  const plugins = ['react-native-reanimated/plugin'];

  // Strip **all** console.* calls & comments from production builds
  // Dev builds keep them for easier debugging.
  if (process.env.NODE_ENV === 'production') {
    plugins.push(
      // Removes console.* calls at compile time
      [
        'transform-remove-console',
        {
          // Remove every console method, incl. warn/error
          exclude: [],
        },
      ],
      // Removes all comments in the compiled bundle
      'transform-remove-comments',
    );
  }

  return {
    presets,
    plugins,
  };
};
