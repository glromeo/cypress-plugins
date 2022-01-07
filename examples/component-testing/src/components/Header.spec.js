import React from 'react'
import Header from './Header'
import {createStore} from 'redux'
import reducer from '../reducers'
import {mount} from '@cypress/react'
import {Provider} from 'react-redux'

function render(propOverrides) {
  const props = Object.assign({
    addTodo: cy.stub()
  }, propOverrides)

  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      <Header {...props} />
    </Provider>
  )

  return {
    props
  }
}

describe('components', () => {
  describe('Header', () => {
    it('should render correctly', () => {
      render()
      cy.get('header.header').should('exist')
      cy.get('header.header > h1')
        .should('exist')
        .should('have.text', 'todos')
      cy.get('header.header > input[type=text].new-todo')
        .should('exist')
        .should('have.attr', 'placeholder', 'What needs to be done?')
    })

    it('should call addTodo if length of text is greater than 0', () => {
      const {props} = render()
      cy.get('header.header > input[type=text].new-todo').as('input')
      cy.get('@input').type('{enter}')
        .then(() => expect(props.addTodo).not.to.be.called)
      cy.get('@input').type('Use Redux{enter}')
        .then(() => expect(props.addTodo).to.be.calledOnce)
    })
  })
})
