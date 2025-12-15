import type { FC } from 'react'
import { UserProvider } from './store/userStore'

const App: FC = () => {
  return (
    <UserProvider>
      {/* Router is configured in main.tsx */}
      <div id="app"></div>
    </UserProvider>
    
  )
}

export default App
