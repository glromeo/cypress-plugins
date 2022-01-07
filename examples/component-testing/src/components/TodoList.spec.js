import React from 'react'
import TodoList from './TodoList'
import {createStore} from 'redux'
import reducer from '../reducers'
import {mount} from '@cypress/react'
import {Provider} from 'react-redux'

function render() {
  const props = {
    filteredTodos: [
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }, {
        text: 'Run the tests',
        completed: true,
        id: 1
      }
    ],
    actions: {
      editTodo: cy.stub(),
      deleteTodo: cy.stub(),
      completeTodo: cy.stub(),
      completeAll: cy.stub(),
      clearCompleted: cy.stub()
    }
  }

  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      <TodoList {...props} />
    </Provider>
  )

  return {
    props
  }
}

describe('components', () => {
  describe('TodoList', () => {
    it('should render container', () => {
      const {props} = render()
      cy.get('ul.todo-list').should('exist')
    })

    it('should render todos', () => {
      const {props} = render()
      cy.get('ul.todo-list li')
        .should('have.length', 2)
        .each(($todo, i) => {
          expect($todo.find('label')).to.have.text(props.filteredTodos[i].text)
        })
    })
  })
})
