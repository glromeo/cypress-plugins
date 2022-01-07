import React from 'react'
import TodoTextInput from './TodoTextInput'
import {createStore} from 'redux'
import reducer from '../reducers'
import {mount} from '@cypress/react'
import {Provider} from 'react-redux'

function render(propOverrides) {
  const props = Object.assign({
    text: 'Use Redux',
    placeholder: 'What needs to be done?',
    editing: false,
    newTodo: false,
    onSave: cy.stub()
  }, propOverrides)

  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      <TodoTextInput {...props} />
    </Provider>
  )

  return {
    props
  }
}

describe('components', () => {
  describe('TodoTextInput', () => {
    it('should render correctly', () => {
      render()
      cy.get('input[type=text]')
        .should('exist')
        .should('have.attr', 'placeholder', 'What needs to be done?')
        .should('have.value', 'Use Redux')
        .should('have.attr', 'class', '')
    })

    it('should render correctly when editing=true', () => {
      render({editing: true})
      cy.get('input[type=text]')
        .should('have.class', 'edit')
    })

    it('should render correctly when newTodo=true', () => {
      render({newTodo: true})
      cy.get('input[type=text]')
        .should('have.class', 'new-todo')
    })

    it('should update value on change', () => {
      render()
      cy.get('input[type=text]')
        .clear()
        .type('Use Radox')
        .should('have.value', 'Use Radox')
    })

    it('should call onSave on return key press', () => {
      const {props} = render()
      cy.get('input[type=text]')
        .clear()
        .type('Use Redux{enter}')
        .then(()=>{
          expect(props.onSave).to.be.calledWith('Use Redux')
        })
    })

    it('should reset state on return key press if newTodo', () => {
      render({newTodo: true})
      cy.get('input[type=text]')
        .clear()
        .type('Use Redux{enter}')
        .should('have.value', '')
    })

    it('should call onSave on blur', () => {
      const {props} = render()
      cy.get('input[type=text]')
        .clear()
        .type('Use Redux')
        .tab()
        .then(()=>{
          expect(props.onSave).to.be.calledWith('Use Redux')
        })
    })

    it('shouldnt call onSave on blur if newTodo', () => {
      const {props} = render({newTodo: true})
      cy.get('input[type=text]')
        .clear()
        .type('Use Redux')
        .tab()
        .then(()=>{
          expect(props.onSave).not.to.be.called
        })
    })
  })
})
