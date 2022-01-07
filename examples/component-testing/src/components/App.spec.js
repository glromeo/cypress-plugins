import React from 'react'
import {mount} from '@cypress/react'
import App from './App'
import Header from '../containers/Header'
import {createStore} from 'redux'
import reducer from '../reducers'
import {Provider} from 'react-redux'

import 'todomvc-app-css/index.css'

function render(children) {
  const store = createStore(reducer)
  mount(
    <Provider store={store}>
      {children}
    </Provider>
  )
}

describe('components', () => {
  describe('Header', () => {
    it('should render', () => {
      render(<App/>)
      cy.get('header.header').should('exist')
    })
  })

  describe('Main section', () => {
    it('should render', () => {
      render(<App/>)
      cy.get('section.main').should('exist')
    })
  })
})
