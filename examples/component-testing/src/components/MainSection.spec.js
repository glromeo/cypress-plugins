import React from 'react'
import MainSection from './MainSection'
import {createStore} from 'redux'
import reducer from '../reducers'
import {mount} from '@cypress/react'
import {Provider} from 'react-redux'

import 'todomvc-app-css/index.css'

function render(propOverrides) {
  const props = Object.assign({
    todosCount: 2,
    completedCount: 1,
    actions: {
      editTodo: cy.stub(),
      deleteTodo: cy.stub(),
      completeTodo: cy.stub(),
      completeAllTodos: cy.stub(),
      clearCompleted: cy.stub()
    }
  }, propOverrides)

  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      <MainSection {...props} />
    </Provider>
  )

  return {
    props
  }
}

describe('components', () => {
  describe('MainSection', () => {
    it('should render container', () => {
      render()
      cy.get('section.main').should('exist')
    })

    describe('toggle all input', () => {
      it('should render', () => {
        render()
        cy.get('section.main input:first-child')
          .should('have.class', 'toggle-all')
          .should('have.attr', 'type', 'checkbox')
          .should('not.be.checked')
      })

      it('should be checked if all todos completed', () => {
        render({completedCount: 2})
        cy.get('section.main input:first-child')
          .should('be.checked')
      })

      it('should call completeAllTodos on change', () => {
        const {props} = render()
        cy.get('section.main > span:first-child > label')
          .click({force: true})
          .then(() => {
            expect(props.actions.completeAllTodos).to.be.called
          })
      })
    })

    describe('footer', () => {
      it('should render', () => {
        render()
        cy.get('footer.footer').should('exist')
      })

      it('onClearCompleted should call clearCompleted', () => {
        const {props} = render()
        cy.get('footer.footer button.clear-completed')
          .should('exist')
          .click()
          .then(() => {
            expect(props.actions.clearCompleted).to.be.called
          })
      })
    })

    describe('visible todo list', () => {
      it('should render', () => {
        render()
        cy.get('ul.todo-list li').should('exist')
      })
    })

    describe('toggle all input and footer', () => {
      it('should not render if there are no todos', () => {
        render({
          todosCount: 0,
          completedCount: 0
        })
        cy.get('ul.filters').should('not.exist')
      })
    })
  })
})
