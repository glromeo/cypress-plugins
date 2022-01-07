Feature: Calculator

  Scenario: 1 + 1 = 2
    Given I opened the calculator app
    And the calculator is ready
    When I do 1 + 1
    Then the result is 2
