import { createSlice } from '@reduxjs/toolkit'
import dayjs from 'dayjs'

const STORAGE_KEY = 'attendance_sys_myLedger'

const loadState = () => {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

const initialState = loadState() || {
  status: 'DRAFT',
  orgUnitName: '',
  ledgerMonth: dayjs().format('YYYY-MM'),
  inWorkCount: 0,
  creatorName: '',
  approvalRecords: [],
  details: [],
  remark: '',
  templateFields: [],
}

const myLedgerSlice = createSlice({
  name: 'myLedger',
  initialState,
  reducers: {
    setDetails(state, action) {
      state.details = action.payload
    },
    updateDetail(state, action) {
      const { id, field, value } = action.payload
      const idx = state.details.findIndex((item) => item.id === id)
      if (idx === -1) return
      state.details[idx][field] = value
      if (field === 'isNonWorking' && value === 0) {
        state.details[idx].nonWorkingReason = ''
      }
    },
    addDetail(state) {
      const maxId = state.details.reduce((max, item) => Math.max(max, item.id || 0), 0)
      const newDetail = {
        id: maxId + 1,
        sortNo: state.details.length + 1,
      }

      // 如果有模板字段，初始化所有字段为空字符串
      if (state.templateFields && state.templateFields.fields) {
        state.templateFields.fields.forEach((field) => {
          if (field.shift) {
            // shift 字段需要初始化两个子字段
            newDetail[`${field.name}`] = ''
            // newDetail[`${field.name}2`] = ''
          } else {
            newDetail[field.name] = ''
          }
        })
      }

      state.details.push(newDetail)
    },
    removeDetail(state, action) {
      state.details = state.details.filter((item) => item.id !== action.payload)
    },
    setRemark(state, action) {
      state.remark = action.payload
    },
    setTemplateFields(state, action) {
      state.templateFields = action.payload
    },
    setLedgerMeta(state, action) {
      Object.assign(state, action.payload)
    },
  },
})

export const { setDetails, updateDetail, addDetail, removeDetail, setRemark, setTemplateFields, setLedgerMeta } = myLedgerSlice.actions
export default myLedgerSlice.reducer
