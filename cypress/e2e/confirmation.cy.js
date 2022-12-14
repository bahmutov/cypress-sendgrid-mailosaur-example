/// <reference types="cypress" />
// @ts-check

// https://github.com/mailosaur/cypress-mailosaur
// register email commands
import 'cypress-mailosaur'

describe('Email flows', () => {
  it('sends confirmation code', () => {
    const serverId = Cypress.env('MAILOSAUR_SERVER_ID')
    const randomId = Cypress._.random(1e6)
    const userEmail = `confirmation-${randomId}@${serverId}.mailosaur.net`
    cy.log(`📧 **${userEmail}**`)

    cy.visit('/')
    cy.get('#name').type('Joe Bravo')
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

    cy.log('**email has the user name**')
    cy.contains(`Dear Joe Bravo,`).should('be.visible')
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
        cy.location('search').should('equal', `?code=${code}`)
        cy.log(`input code field is prefilled with code ${code}`)
        cy.get('#confirmation_code')
          .should('be.visible')
          .and('have.value', code)
        cy.get('button[type=submit]').click()
        // first positive assertion, then negative
        // https://glebbahmutov.com/blog/negative-assertions/
        cy.get('[data-cy=confirmed-code]').should('be.visible')
        cy.get('[data-cy=incorrect-code]').should('not.exist')
      })
  })
})
