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

export const store = configureStore({
  reducer: {
    user: userReducer,
    myLedger: myLedgerReducer,
  }
})

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    saveMyLedgerState(store.getState().myLedger)
  })
}
