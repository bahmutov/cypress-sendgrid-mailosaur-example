/// <reference types="cypress" />
// @ts-check

// https://github.com/mailosaur/cypress-mailosaur
// register email commands
import 'cypress-mailosaur'

// https://github.com/bahmutov/cypress-log-to-term
import 'cypress-log-to-term/commands'

// https://github.com/bahmutov/cypress-data-session
import 'cypress-data-session'

describe('An email', () => {
  if (Cypress.env('skipEmailTests')) {
    it('shows the code by itself')
    it('has the confirmation code link')
    it('has the working code')
    return
  }

  beforeEach(() => {
    cy.dataSession({
      name: 'email',
      setup() {
        const userName = 'Joe Bravo'
        const serverId = Cypress.env('MAILOSAUR_SERVER_ID')
        const randomId = Cypress._.random(1e6)
        const userEmail = `user-${randomId}@${serverId}.mailosaur.net`
        cy.log(`📧 **${userEmail}**`)

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
      },
      shareAcrossSpecs: true,
    })
  })

  beforeEach(function () {
    cy.document({ log: false }).invoke({ log: false }, 'write', this.email)
  })

  // during interactive work, comment this "after" hook
  // to keep reusing the same email for speed
  after(() => {
    Cypress.clearDataSession('email')
  })

  it('shows the code by itself', () => {
    cy.contains('strong', /^[a-z0-9]{8}$/)
      .invoke('text')
      .log()
  })

  it('has the confirmation code link', function () {
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
      })
  })

  it('has the working code', function () {
    cy.contains('a', 'Enter the confirmation code')
      .should('be.visible')
      // by default the link wants to open a new window
      .and('have.attr', 'target', '_blank')
      // but the test can point the open back at itself
      // so the click opens it in the current browser window
      .invoke('attr', 'target', '_self')
      .click()
    // confirm the URL changed back to our web app
    cy.location('pathname', { timeout: 30000 }).should('equal', '/confirm')
    cy.location('search').should('include', `?code=`)
    cy.get('#confirmation_code')
      .should('be.visible')
      .invoke('val')
      .should('not.be.empty')
    cy.get('button[type=submit]').click()
    // first positive assertion, then negative
    // https://glebbahmutov.com/blog/negative-assertions/
    cy.get('[data-cy=confirmed-code]').should('be.visible')
    cy.get('[data-cy=incorrect-code]').should('not.exist')
  })
})
