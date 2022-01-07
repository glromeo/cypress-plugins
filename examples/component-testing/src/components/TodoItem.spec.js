import React from 'react'
import TodoItem from './TodoItem'
import {createStore} from 'redux'
import reducer from '../reducers'
import {mount} from '@cypress/react'
import {Provider} from 'react-redux'

function render(editing = false) {
  const props = {
    todo: {
      id: 0,
      text: 'Use Redux',
      completed: false
    },
    editTodo: cy.stub(),
    deleteTodo: cy.stub(),
    completeTodo: cy.stub()
  }

  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      <TodoItem {...props} />
    </Provider>
  )

  if (editing) {
    cy.get('label').dblclick()
  }

  return {
    props
  }
}

describe('components', () => {
  describe('TodoItem', () => {
    it('initial render', () => {
      render()
      cy.get('li > div.view')
        .should('exist')
        .then($div => {
          cy.wrap($div).find('input[type=checkbox]').should('not.be.checked')
          cy.wrap($div).find('label').should('have.text', 'Use Redux')
          cy.wrap($div).find('button').should('have.class', 'destroy')
        })
    })

    it('input onChange should call completeTodo', () => {
      const {props} = render()
      cy.get('input[type=checkbox]')
        .click()
        .then(() => {
          expect(props.completeTodo).to.be.calledWith(0)
        })
    })

    it('button onClick should call deleteTodo', () => {
      const {props} = render()
      cy.get('button')
        .click()
        .then(() => {
          expect(props.deleteTodo).to.be.calledWith(0)
        })
    })

    it('label onDoubleClick should put component in edit state', () => {
      const {props} = render()
      cy.get('label')
        .dblclick()
        .then(() => {
          cy.get('li').should('have.class', 'editing')
        })
    })

    it('edit state render', () => {
      const {props} = render(true)
      cy.get('li.editing').should('exist')
      cy.get('li input')
        .should('have.value', 'Use Redux')
        .should('have.class', 'edit')
    })

    it('TodoTextInput onSave should call editTodo', () => {
      const {props} = render(true)
      cy.get('li input')
        .clear()
        .type('Use Redux{enter}')
        .then(() => {
          expect(props.editTodo).to.be.calledWith(0, 'Use Redux')
        })
    })

    it('TodoTextInput onSave should call deleteTodo if text is empty', () => {
      const {props} = render(true)
      cy.get('li input')
        .clear()
        .type('{enter}')
        .then(() => {
          expect(props.deleteTodo).to.be.calledWith(0)
        })
    })

    it('TodoTextInput onSave should exit component from edit state', () => {
      render(true)
      cy.get('li input')
        .type('Whatever{enter}')
        .then(() => {
          cy.get('li').should('not.have.class', 'editing')
        })
    })
  })
})
