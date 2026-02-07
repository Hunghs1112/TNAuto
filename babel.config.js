module.exports = function (api) {
  api.cache(true);

  const presets = [
    // Default React-Native preset
    '@react-native/babel-preset',
  ];

  const plugins = ['react-native-worklets/plugin'];


  return {
    presets,
    plugins,
  };
};
