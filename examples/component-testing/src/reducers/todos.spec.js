import todos from './todos'
import * as types from '../constants/ActionTypes'

describe('todos reducer', () => {
  it('should handle initial state', () => {
    expect(
      todos(undefined, {})
    ).eql([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle ADD_TODO', () => {
    expect(
      todos([], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).eql([
      {
        text: 'Run the tests',
        completed: false,
        id: 0
      }
    ])

    expect(
      todos([
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).eql([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      },
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      }
    ])

    expect(
      todos([
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        }, {
          text: 'Run the tests',
          completed: false,
          id: 1
        }
      ], {
        type: types.ADD_TODO,
        text: 'Fix the tests'
      })
    ).eql([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      },
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      },
      {
        text: 'Fix the tests',
        completed: false,
        id: 2
      }
    ])
  })

  it('should handle DELETE_TODO', () => {
    expect(
      todos([
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        },
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }
      ], {
        type: types.DELETE_TODO,
        id: 1
      })
    ).eql([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle EDIT_TODO', () => {
    expect(
      todos([
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: types.EDIT_TODO,
        text: 'Fix the tests',
        id: 1
      })
    ).eql([
      {
        text: 'Fix the tests',
        completed: false,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle COMPLETE_TODO', () => {
    expect(
      todos([
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: types.COMPLETE_TODO,
        id: 1
      })
    ).eql([
      {
        text: 'Run the tests',
        completed: true,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle COMPLETE_ALL_TODOS', () => {
    expect(
      todos([
        {
          text: 'Run the tests',
          completed: true,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: types.COMPLETE_ALL_TODOS
      })
    ).eql([
      {
        text: 'Run the tests',
        completed: true,
        id: 1
      }, {
        text: 'Use Redux',
        completed: true,
        id: 0
      }
    ])

    // Unmark if all todos are currently completed
    expect(
      todos([
        {
          text: 'Run the tests',
          completed: true,
          id: 1
        }, {
          text: 'Use Redux',
          completed: true,
          id: 0
        }
      ], {
        type: types.COMPLETE_ALL_TODOS
      })
    ).eql([
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle CLEAR_COMPLETED', () => {
    expect(
      todos([
        {
          text: 'Run the tests',
          completed: true,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: types.CLEAR_COMPLETED
      })
    ).eql([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should not generate duplicate ids after CLEAR_COMPLETED', () => {
    expect(
      [
        {
          type: types.COMPLETE_TODO,
          id: 0
        }, {
        type: types.CLEAR_COMPLETED
      }, {
        type: types.ADD_TODO,
        text: 'Write more tests'
      }
      ].reduce(todos, [
        {
          id: 0,
          completed: false,
          text: 'Use Redux'
        }, {
          id: 1,
          completed: false,
          text: 'Write tests'
        }
      ])
    ).eql([
      {
        text: 'Write tests',
        completed: false,
        id: 1
      }, {
        text: 'Write more tests',
        completed: false,
        id: 2
      }
    ])
  })
})
