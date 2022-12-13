const { defineConfig } = require('cypress')

if (typeof process.env.CYPRESS_MAILOSAUR_SERVER_ID === 'undefined') {
  throw new Error('Missing CYPRESS_MAILOSAUR_SERVER_ID')
}
if (typeof process.env.CYPRESS_MAILOSAUR_API_KEY === 'undefined') {
  throw new Error('Missing CYPRESS_MAILOSAUR_API_KEY')
}

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
