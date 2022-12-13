/// <reference types="cypress" />
// @ts-check

// https://github.com/mailosaur/cypress-mailosaur
// register email commands
import 'cypress-mailosaur'

// https://github.com/bahmutov/cypress-log-to-term
import 'cypress-log-to-term/commands'

describe('Email flows', () => {
  const serverId = Cypress.env('MAILOSAUR_SERVER_ID')
  let userEmail

  before(() => {
    // this spec will use the same email

    const randomId = Cypress._.random(1e6)
    userEmail = `confirmation-${randomId}@${serverId}.mailosaur.net`
    cy.log(`📧 **${userEmail}**`)
  })

  it.only('sends confirmation code', () => {
    const userName = 'Joe Bravo'

    cy.visit('/')
    cy.get('#name').type(userName)
    cy.get('#company_size').select('3')
    cy.get('#email').type(userEmail)
    cy.get('button[type=submit]').click()

    cy.log('**shows message to check emails**')
    cy.get('[data-cy=sent-email-to]')
      .should('be.visible')
      .and('have.text', userEmail)

    cy.mailosaurGetMessage(serverId, {
      sentTo: userEmail,
    })
      .then(console.log)
      .its('html.body')
      .then((html) => {
        cy.document({ log: false }).invoke({ log: false }, 'write', html)
      })

    // // retry fetching the email
    // recurse(
    //   () => cy.task('getLastEmail'), // Cypress commands to retry
    //   Cypress._.isObject, // keep retrying until the task returns an object
    //   {
    //     timeout: 60000, // retry up to 1 minute
    //     delay: 5000, // wait 5 seconds between attempts
    //   },
    // )
    //   .its('html')
    //   .then((html) => {
    //     cy.document({ log: false }).invoke({ log: false }, 'write', html)
    //   })
    cy.log('**email has the user name**')
    cy.contains(`Dear ${userName},`).should('be.visible')
    cy.log('**email has the confirmation code**')
    cy.contains('a', 'Enter the confirmation code')
      .should('be.visible')
      .as('codeLink')
      .invoke('text')
      .then((text) => Cypress._.last(text.split(' ')))
      .then((code) => {
        cy.log(`**confirm the code ${code} works**`)
        expect(code, 'confirmation code')
          .to.be.a('string')
          .and.have.length.gt(5)

        // add synthetic delay, otherwise the email
        // flashes very quickly
        cy.wait(2000)

        // before we click on the link, let's make sure it
        // does not open a new browser window
        // https://glebbahmutov.com/blog/cypress-second-tab/
        cy.get('@codeLink')
          // by default the link wants to open a new window
          .should('have.attr', 'target', '_blank')
          // but the test can point the open back at itself
          // so the click opens it in the current browser window
          .invoke('attr', 'target', '_self')
          .click()

        // confirm the URL changed back to our web app
        cy.location('pathname', { timeout: 30000 }).should('equal', '/confirm')
        cy.get('#confirmation_code').should('be.visible').type(code)
        cy.get('button[type=submit]').click()
        // first positive assertion, then negative
        // https://glebbahmutov.com/blog/negative-assertions/
        cy.get('[data-cy=confirmed-code]').should('be.visible')
        cy.get('[data-cy=incorrect-code]').should('not.exist')
      })
  })
})
