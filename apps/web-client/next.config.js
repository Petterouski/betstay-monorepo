// @ts-nocheck
// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    svgr: false,
  },
  output: 'standalone',
  // CORRECCIÓN: Ahora esta propiedad va en la raíz, NO dentro de experimental
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

const plugins = [
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);