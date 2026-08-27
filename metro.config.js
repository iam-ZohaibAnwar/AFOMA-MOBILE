const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// socket.io-client: use CJS/bundled entry — ESM subpaths break in Metro (webtransport.js).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
