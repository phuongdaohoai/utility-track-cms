import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import './index.css'
import { router } from './router'
import store from './store/store'
import { LocaleProvider } from './i18n/LocaleContext'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </Provider>
  </StrictMode>,
)
