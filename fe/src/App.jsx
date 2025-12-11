/**
 * App Component
 * Main app wrapper with router
 */
import { UserProvider } from './store/userStore'

function App() {
  return (
    <UserProvider>
      {/* Router is configured in main.jsx */}
      <div id="app"></div>
    </UserProvider>
  )
}

export default App

