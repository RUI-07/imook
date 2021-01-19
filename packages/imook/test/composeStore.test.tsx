import {createLocalStore, ActUtil, Provider, withStores} from '../src/index'
import React from 'react'
import {render} from '@testing-library/react'

type CounterActUtil = ActUtil<number>

const storeA = createLocalStore(1, {
  inc({commit}: CounterActUtil, step = 1) {
    commit(draftStore => {
      draftStore.state += step
    })
  },
})

const storeB = createLocalStore(2, {
  inc({commit}: CounterActUtil, step = 1) {
    commit(draftStore => {
      draftStore.state += step
    })
  },
})

const Comp = () => {
  const [stateA, {inc: incA}] = storeA.useStore()
  const [stateB, {inc: incB}] = storeB.useStore()
  return (
    <div>
      <button className="storeA" onClick={() => incA()}>
        {stateA}
      </button>
      <button className="storeB" onClick={() => incB()}>
        {stateB}
      </button>
    </div>
  )
}

describe('compose way', () => {
  test('compose store way one', () => {
    const App = () => {
      return (
        <Provider stores={[storeA, storeB]}>
          <Comp />
        </Provider>
      )
    }
    const result = render(<App />)
    const a = result.getByText(/.*/, {selector: '.storeA'})
    const b = result.getByText(/.*/, {selector: '.storeB'})
    expect(a.textContent).toBe('1')
    expect(b.textContent).toBe('2')
    a.click()
    b.click()
    expect(a.textContent).toBe('2')
    expect(b.textContent).toBe('3')
  })
  test('compose store way Two', () => {
    const App = withStores(() => <Comp />, [storeB, storeA])
    const result = render(<App />)
    const a = result.getByText(/.*/, {selector: '.storeA'})
    const b = result.getByText(/.*/, {selector: '.storeB'})
    expect(a.textContent).toBe('1')
    expect(b.textContent).toBe('2')
    a.click()
    b.click()
    expect(a.textContent).toBe('2')
    expect(b.textContent).toBe('3')
  })
})
