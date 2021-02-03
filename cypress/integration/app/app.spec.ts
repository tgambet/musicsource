it('should display MusicSource', () => {
  cy.visit('/');
  cy.contains('MusicSource');
});
