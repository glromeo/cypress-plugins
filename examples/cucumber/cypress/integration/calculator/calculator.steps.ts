/// <reference types="cypress" />

// Cypress does support TypeScript out of the box, as long as you have a tsconfig.json file.
// However, imports don't work unless you preprocess your TypeScript files.

import { Given, And, When, Then } from "cypress-cucumber-preprocessor/steps";

Given("I opened the calculator app", function ():void {
    cy.visit("/index.html");
});

And("the calculator is ready", function ():void {
    cy.get("#left").should("have.value", "");
    cy.get("#right").should("have.value", "");
    cy.get("#result").should("have.value", "");
});

When("I do {int} + {int}", function (left:number, right:number):void {
    cy.get("#left").type(String(left));
    cy.get("#right").type(String(right));
    cy.wait(250);
    cy.get("#left").should("have.value", "1");
    cy.get("#right").should("have.value", "1");
    cy.get("button:contains('Calculate')").click();
});

Then("the result is {int}", function (result:number):void {
    cy.get("#result").should("have.value", String(result));
});
