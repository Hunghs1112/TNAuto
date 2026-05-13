module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-redux|@react-native|react-native|@reduxjs/toolkit|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
};
