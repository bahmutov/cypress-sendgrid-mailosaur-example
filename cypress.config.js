// @ts-check
const { defineConfig } = require('cypress')
const registerDataSession = require('cypress-data-session/src/plugin')
const axios = require('axios')

if (typeof process.env.CYPRESS_MAILOSAUR_SERVER_ID === 'undefined') {
  throw new Error('Missing CYPRESS_MAILOSAUR_SERVER_ID')
}
if (typeof process.env.CYPRESS_MAILOSAUR_API_KEY === 'undefined') {
  throw new Error('Missing CYPRESS_MAILOSAUR_API_KEY')
}

/**
 * Pings Mailosaur to fetch the current usage
 * @see https://mailosaur.com/docs/api/usage/
 */
async function getEmailUsage() {
  try {
    const usage = await axios.get('https://mailosaur.com/api/usage/limits', {
      auth: {
        username: 'api',
        password: process.env.CYPRESS_MAILOSAUR_API_KEY,
      },
    })
    return usage.data.email
  } catch (e) {
    console.error('problem fetching Mailosaur usage')
    console.error(e.message)
  }
}

/**
 * Returns true if we are inside "cypress open" command
 */
const isInteractive = (config) => {
  return !config.isTextTerminal
}

/**
 * Checks if we can still perform email testing, depending on the 3rd party usage.
 * If we are over the limit - hard no.
 * If we are close to the limit:
 *  If we are in the interactive mode "cypress open" allow testing
 *  Else do not allow email testing
 * This gives preference to human email test writing
 * Note: modifies the config.env object to disable email testing.
 */
async function checkIfEmailTestingIsPossible(config) {
  const emailUsage = await getEmailUsage()
  emailUsage.limit = 50
  console.log('email usage limits', emailUsage)
  // hard limit
  if (emailUsage.current >= emailUsage.limit) {
    console.log(
      '📧 current email usage %d is close to the limit %d',
      emailUsage.current,
      emailUsage.limit,
    )
    console.log('📧🛑 will skip email tests')
    config.env.skipEmailTests = true
  } else if (emailUsage.current + 25 >= emailUsage.limit) {
    // soft limit - only allow human interactive testing
    // during "cypress open"
    if (isInteractive(config)) {
      console.log(
        '📧 current email usage %d is close to the soft limit %d',
        emailUsage.current,
        emailUsage.limit,
      )
      console.log(
        '📧 but we are running in the interactive mode, allow email testing',
      )
    } else {
      console.log(
        '📧 current email usage %d is close to the soft limit %d',
        emailUsage.current,
        emailUsage.limit,
      )
      console.log('📧🛑 will skip email tests')
      config.env.skipEmailTests = true
    }
  }
}

module.exports = defineConfig({
  fixturesFolder: false,
  viewportWidth: 1200,
  viewportHeight: 800,
  video: false,
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:3000',
    async setupNodeEvents(on, config) {
      // register the "cypress-log-to-term" plugin
      // https://github.com/bahmutov/cypress-log-to-term
      // IMPORTANT: pass the "on" callback argument
      require('cypress-log-to-term')(on)
      registerDataSession(on, config)
      await checkIfEmailTestingIsPossible(config)

      // IMPORTANT: return the config object
      return config
    },
  },
})
