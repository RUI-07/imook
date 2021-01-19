import {createLocalStore, ActUtil} from '../src/index'
import React from 'react'
import {render} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

// store init
const initialState = 0
type CounterActUtil = ActUtil<number>
const counterStore = createLocalStore(initialState, {
  inc({commit}: CounterActUtil, step = 1) {
    commit(draftStore => {
      draftStore.state += step
    })
  },
  dec({commit}: CounterActUtil) {
    commit(draftStore => {
      draftStore.state -= 1
    })
  },
  reset({commit}: CounterActUtil) {
    commit(draftStore => {
      draftStore.state = initialState
    })
  },
})

function ChildInStore({id = '0', btns = ['+', '-']}) {
  const [count, {inc, dec}] = counterStore.useStore()
  return (
    <div>
      <span className={'count-display-' + id}>{count}</span>
      {btns.includes('+') && (
        <button
          className={'add-button-' + id}
          onClick={() => {
            inc(1)
          }}>
          +
        </button>
      )}
      {btns.includes('-') && (
        <button
          className={'minus-button-' + id}
          onClick={() => {
            dec()
          }}>
          -
        </button>
      )}
    </div>
  )
}

const ResetBtn = () => {
  const {reset} = counterStore.useActions()
  return <button onClick={reset}>reset</button>
}

function Counter() {
  return (
    <counterStore.Provider>
      <ChildInStore btns={['+']} />
      <ChildInStore id="1" btns={['-']} />
      <ResetBtn />
    </counterStore.Provider>
  )
}

describe('counter demo', () => {
  test('counter initial value', () => {
    const result = render(<Counter />)
    const display = result.getByText(/.*/, {selector: '.count-display-0'})
    expect(display.textContent).toBe('0')
  })
  test('count add one', () => {
    const result = render(<Counter />)
    const display = result.getByText(/.*/, {selector: '.count-display-0'})
    const addButton = result.getByText('+')
    addButton.click()
    expect(display.textContent).toBe('1')
  })
  test('count minus one', () => {
    const result = render(<Counter />)
    const display = result.getByText(/.*/, {selector: '.count-display-0'})
    const minusButton = result.getByText('-')
    minusButton.click()
    expect(display.textContent).toBe('-1')
  })
  test('count add one then minus one', () => {
    const result = render(<Counter />)
    const display = result.getByText(/.*/, {selector: '.count-display-0'})
    const addButton = result.getByText('+')
    const minusButton = result.getByText('-')
    addButton.click()
    minusButton.click()
    expect(display.textContent).toBe('0')
  })
  test('counter reset', () => {
    const result = render(<Counter />)
    const display = result.getByText(/.*/, {selector: '.count-display-0'})
    const addButton = result.getByText('+')
    const resetButton = result.getByText('reset')
    addButton.click()
    addButton.click()
    addButton.click()
    resetButton.click()
    expect(display.textContent).toBe('0')
  })
})
