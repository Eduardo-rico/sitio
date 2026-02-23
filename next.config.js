const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['node-fetch'] = path.resolve(
        __dirname,
        'lib/shims/node-fetch.ts'
      )
    }

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /pyodide[\\/]pyodide\.mjs$/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ]

    return config
  },
}

module.exports = nextConfig
