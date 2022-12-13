const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fixturesFolder: false,
  viewportWidth: 1200,
  viewportHeight: 800,
  video: true,
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:3000',
  },
})
