import '@testing-library/jest-dom/extend-expect'
import * as Imook from '../src/index'

describe('imook api', () => {
  test('imook api version 1.0.5', () => {
    expect(Imook).toHaveProperty('createLocalStore')
    expect(Imook).toHaveProperty('Provider')
    expect(Imook).toHaveProperty('withStores')
  })
})
