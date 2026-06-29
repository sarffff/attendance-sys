import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/user'
import myLedgerReducer from './modules/myLedger'

const STORAGE_KEY = 'attendance_sys_myLedger'

const saveMyLedgerState = (state) => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore write errors
  }
}

const removeMyLedgerState = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore remove errors
  }
}

const myLedgerStorageMiddleware = (storeApi) => (next) => (action) => {
  const result = next(action)

  if (action.type === 'user/logout') {
    removeMyLedgerState()
  } else {
    saveMyLedgerState(storeApi.getState().myLedger)
  }

  return result
}

export const store = configureStore({
  reducer: {
    user: userReducer,
    myLedger: myLedgerReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(myLedgerStorageMiddleware),
})
