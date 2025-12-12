import type { FC } from 'react'
import { Provider } from 'react-redux'
import store from './store/store'

const App: FC = () => {
  return (
    <Provider store={store}>
      {/* Router is configured in main.tsx */}
      <div id="app"></div>
    </Provider>
  )
}

export default App
