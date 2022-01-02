describe('MusicSource', () => {
  before(() => cy.deleteDatabase('musicsource'));

  it('should redirect to /welcome', () => {
    cy.visit('/').url().should('include', '/welcome').contains('MusicSource');
  });

  // it('should display library when scanned=1', () => {
  //   cy.visit('/');
  //   cy.url().should('include', '/library');
  //   cy.contains('MusicSource');
  //   cy.clearLocalStorage().should(
  //     (ls) => expect(ls.getItem('scanned')).to.be.null
  //   );
  // });
  //
  // it('should clear database and redirect to /welcome', () => {
  //   localStorage.setItem('scanned', '1');
  //   cy.visit('/');
  //   cy.url().should('include', '/library');
  //   cy.get('app-menu').click();
  //   cy.contains('Clear database').click();
  //   cy.url().should('include', '/welcome');
  // });
});
