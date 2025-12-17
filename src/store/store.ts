import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import usersReducer from './usersSlice'
import staffReducer from './staffSlice'
import csvImportReducer from './csvImportSlice'
import roleReducer from './roleSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    staff: staffReducer,
    csvImport: csvImportReducer,
    roles: roleReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;