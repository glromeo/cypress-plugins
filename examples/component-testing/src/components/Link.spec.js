import React from 'react'
import Link from './Link'
import {createStore} from 'redux'
import reducer from '../reducers'
import {mount} from '@cypress/react'
import {Provider} from 'react-redux'

function render(propOverrides) {
  const props = Object.assign({
    active: false,
    children: 'All',
    setFilter: cy.stub()
  }, propOverrides)

  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      <Link {...props} />
    </Provider>
  )

  return {
    props
  }
}

describe('component', () => {
  describe('Link', () => {
    it('should render correctly', () => {
      render()
      cy.get('a')
        .should('exist')
        .should('have.css', 'cursor', 'pointer')
        .should('have.text', 'All')
    })

    it('should have class selected if active', () => {
      render({active: true})
      cy.get('a')
        .should('have.class', 'selected')
    })

    it('should call setFilter on click', () => {
      const {props} = render()
      cy.get('a')
        .click()
        .then(() => expect(props.setFilter).to.be.calledOnce)
    })
  })
})
