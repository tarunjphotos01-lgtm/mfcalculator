module.exports = {
    testEnvironment: "jsdom", // for React testing
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest", // transform JS/TSX files
    },
    transformIgnorePatterns: [
      "/node_modules/(?!(axios|react-router-dom)/)", // transform ESM modules like axios & router
    ],
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"], // RTL matchers
  };
  