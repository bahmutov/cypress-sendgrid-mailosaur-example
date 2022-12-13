it('rejects wrong code', () => {
  cy.visit('/confirm')
  cy.get('#confirmation_code').type('wrong code')
  cy.get('button[type=submit]').click()
  // first positive assertion, then negative
  // https://glebbahmutov.com/blog/negative-assertions/
  cy.get('[data-cy=incorrect-code]').should('be.visible')
  cy.get('[data-cy=confirmed-code]').should('not.exist')
})
