/// <reference types="cypress" />

before(function () {
  console.log("coverage:before");
  return cy.task("coverage:before");
})

after(function () {
  console.log("coverage:after");
  return cy.task("coverage:after");
})