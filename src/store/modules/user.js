import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  token: localStorage.getItem('attendance-token') || '',
  userInfo: JSON.parse(localStorage.getItem('attendance-userInfo')) || {}
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload
      localStorage.setItem('attendance-token', action.payload)
    },
    setUserInfo(state, action) {
      state.userInfo = action.payload
      localStorage.setItem('attendance-userInfo', JSON.stringify(action.payload))
    },
    logout(state) {
      state.token = ''
      state.userInfo = {}
      localStorage.removeItem('attendance-token')
      sessionStorage.removeItem('attendance_sys_myLedger')
    }
  }
})

export const { setToken, setUserInfo, logout } = userSlice.actions
export default userSlice.reducer
