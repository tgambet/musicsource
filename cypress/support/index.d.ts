declare namespace Cypress {
  interface Chainable {
    deleteDatabase(name: string): Chainable<void>;
  }
}
