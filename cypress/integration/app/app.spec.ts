import { clearIndexedDb } from '../common/indexeddb';

describe('MusicSource', () => {
  before(() => clearIndexedDb());

  it('should redirect to /welcome', () => {
    cy.visit('/');
    cy.url().should('include', '/welcome');
    cy.contains('MusicSource');
    expect(localStorage.getItem('scanned')).to.be.null;
  });

  it('should display library when scanned=1', () => {
    localStorage.setItem('scanned', '1');
    cy.visit('/');
    cy.url().should('include', '/library');
    cy.contains('MusicSource');
    expect(localStorage.getItem('scanned')).to.eq('1');
    cy.clearLocalStorage().should((ls) => {
      expect(ls.getItem('scanned')).to.be.null;
    });
  });

  it('should clear database and redirect to /welcome', () => {
    localStorage.setItem('scanned', '1');
    cy.visit('/');
    cy.url().should('include', '/library');
    cy.get('app-menu').click();
    cy.contains('Clear database').click();
    cy.url().should('include', '/welcome');
  });
});
