import {createLocalStore, ActUtil} from '../src/index'
import {renderHook} from '@testing-library/react-hooks'
import '@testing-library/jest-dom/extend-expect'
import {act} from 'react-dom/test-utils'
import 'regenerator-runtime'
import 'core-js'

const initialState = 0

type CounterActUtil = ActUtil<number>

const store = createLocalStore(initialState, {
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
  async asyncAdd({commit}: CounterActUtil, value: number) {
    return new Promise(resolve =>
      setTimeout(() => {
        commit(draft => {
          draft.state += value
        })
        resolve(undefined)
      }, 100),
    )
  },
  reset({commit}: CounterActUtil) {
    commit(draftStore => {
      draftStore.state = initialState
    })
  },
})

const {Provider, useStore} = store
const renderUserStoreHook = () => {
  const {result} = renderHook(() => useStore(), {
    wrapper: Provider,
  })
  const state = () => result.current[0]
  const actions = () => result.current[1]
  return {
    state,
    actions,
  }
}

describe('createLocalStore return test', () => {
  test('should have some api in createLocalStore return', () => {
    expect(store).toHaveProperty('Provider')
    expect(store).toHaveProperty('useActions')
    expect(store).toHaveProperty('useStore')
    expect(store).toHaveProperty('useSubscribe')
  })
})

describe('useStore tests', () => {
  test('should state is initialState when actions not called', () => {
    const {result} = renderHook(() => useStore(), {
      wrapper: Provider,
    })
    const state = () => result.current[0]
    expect(result.current).toBeInstanceOf(Array)
    expect(state()).toBe(initialState)
  })
  test('should be right when action called with argument', () => {
    const {state, actions} = renderUserStoreHook()
    act(() => {
      actions().inc(3)
    })
    expect(state()).toBe(3)
  })
  test('should be right when actions called in order', () => {
    const {state, actions} = renderUserStoreHook()
    act(() => {
      actions().inc()
      actions().dec()
      actions().inc()
      actions().inc()
    })
    expect(state()).toBe(2)
  })
  test('should update store state in batch', () => {
    const {state, actions} = renderUserStoreHook()
    act(() => {
      actions().inc()
      expect(state()).toBe(0)
      actions().dec()
      expect(state()).toBe(0)
      actions().inc()
      expect(state()).toBe(0)
      actions().inc()
    })
    expect(state()).toBe(2)
  })
  // async action
  test('should be right when async action called in order', async () => {
    const {state, actions} = renderUserStoreHook()
    await act(async () => {
      await actions().asyncAdd(10)
      await actions().asyncAdd(5)
      await actions().asyncAdd(5)
    })
    expect(state()).toBe(20)
  })
  test('should update stroe sequential when call async action', async () => {
    const {state, actions} = renderUserStoreHook()
    await act(async () => {
      await actions().asyncAdd(10)
      expect(state()).toBe(10)
      await actions().asyncAdd(5)
      expect(state()).toBe(15)
      await actions().asyncAdd(5)
    })
    expect(state()).toBe(20)
  })
  test('should be right when call async and sync interlaced', async () => {
    const {state, actions} = renderUserStoreHook()
    await act(async () => {
      actions().inc()
      actions().inc()
      expect(state()).toBe(0)
      await actions().asyncAdd(1)
      expect(state()).toBe(3)
      actions().inc()
      actions().inc()
      expect(state()).toBe(5)
    })
    expect(state()).toBe(5)
  })
})
