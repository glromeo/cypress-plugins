import React from 'react'
import Footer from './Footer'
import {mount} from '@cypress/react'
import {createStore} from 'redux'
import reducer from '../reducers'
import {Provider} from 'react-redux'

function render(propOverrides) {
  const props = Object.assign({
    completedCount: 0,
    activeCount: 0,
    onClearCompleted: cy.stub()
  }, propOverrides)

  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      <Footer {...props} />
    </Provider>
  )

  return {
    props
  }
}

const getTextContent = elem => {
  const children = Array.isArray(elem.props.children) ?
    elem.props.children : [elem.props.children]

  return children.reduce((out, child) =>
      // Concatenate the text
      // Children are either elements or text strings
      out + (child.props ? getTextContent(child) : child)
    , '')
}

describe('components', () => {
  describe('Footer', () => {
    it('should render container', () => {
      render()
      cy.get('footer.footer').should('exist')
    })

    it('should display active count when 0', () => {
      render({activeCount: 0})
      cy.get('footer.footer > .todo-count').should('have.text', 'No items left')
    })

    it('should display active count when above 0', () => {
      render({activeCount: 1})
      cy.get('footer.footer > .todo-count').should('have.text', '1 item left')
    })

    it('should render filters', () => {
      const filterTitles = ['All', 'Active', 'Completed']
      render()
      cy.get('footer.footer > ul.filters > li')
        .should('exist')
        .should('have.length', 3)
        .each(($li, i) => {
          expect($li.text()).to.eq(filterTitles[i])
        })
    })

    it('shouldnt show clear button when no completed todos', () => {
      render({completedCount: 0})
      cy.get('footer.footer button.clear-completed').should('not.exist')
    })

    it('should render clear button when completed todos', () => {
      render({completedCount: 1})
      cy.get('footer.footer button.clear-completed')
        .should('exist')
        .should('have.text', 'Clear completed')
    })

    it('should call onClearCompleted on clear button click', () => {
      const {props} = render({completedCount: 1})
      cy.get('footer.footer button.clear-completed')
        .click()
        .then(() => expect(props.onClearCompleted).to.be.calledOnce)
    })
  })
})
