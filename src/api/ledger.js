import request from '../utils/request'

//导入现员表
export function importBasic(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/ledger/import-basic',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

//导出现员表
export function exportBasic(orgUnitId) {
  return request({
    url: '/ledger/basic/export',
    method: 'get',
    params: { orgUnitId },
    responseType: 'blob'
  })
}

//下发现员表
export function distributeBasic(data) {
  return request({
    url: '/ledger/distribute',
    method: 'post',
    data
  })
}

// 获取现员表
export function getEmployeeBasic(params) {
  return request({
    url: '/ledger/basic/my',
    method: 'get',
    params
  })
}

//修改现员表
export function updateEmployeeBasic(data) {
  return request({
    url: '/ledger/basic/update',
    method: 'put',
    data
  })
}

//获取所有的考勤管理员
export function getAllAdmins() {
  return request({
    url: '/ledger/attendance-admins',
    method: 'get'
  })
}

//生成台账
export function generateLedger(orgUnitId, month) {
  return request({
    url: '/ledger/generate',
    method: 'post',
    params: { orgUnitId, month }
  })
}

//获取所有台账列表
export function getAllLedgers(params) {
  return request({
    url: '/ledger/all',
    method: 'get',
    params
  })
}

//更新台账配置
export function updateConfig(data) {
  return request({
    url: '/ledger/config',
    method: 'put',
    data
  })
}

export function getMyLedger(month) {
  return request({
    url: '/ledger/my',
    method: 'get',
    params: { month }
  })
}

export function saveLedgerDetails(id, data) {
  return request({
    url: `/ledger/${id}/details`,
    method: 'put',
    data
  })
}

//同步现员表到台账
export function syncBasic(month) {
  return request({
    url: '/ledger/sync',
    method: 'post',
    params: { month }
  })
}

//提交台账
export function submitLedger(id) {
  return request({
    url: `/ledger/${id}/submit`,
    method: 'post'
  })
}

//获取待审核的台账
export function getPendingLedgers(status) {
  return request({
    url: '/ledger/pending',
    method: 'get',
    params: { status }
  })
}

//主任审批
export function approveLedger(id, data) {
  return request({
    url: `/ledger/${id}/approve`,
    method: 'post',
    data
  })
}

//人事审核
export function hrReviewLedger(id, data) {
  return request({
    url: `/ledger/${id}/hr-review`,
    method: 'post',
    data
  })
}

//获取台账详情
export function getLedgerDetail(id) {
  return request({
    url: `/ledger/${id}`,
    method: 'get'
  })
}

//导出台账PDF
export function exportLedgerPdf(id) {
  return request({
    url: `/ledger/${id}/pdf`,
    method: 'get',
    responseType: 'blob'
  })
}

//导出台账Excel
export function exportLedgerExcel(id) {
  return request({
    url: `/ledger/${id}/excel`,
    method: 'get',
    responseType: 'blob'
  })
}

//获取台账对比
export function compareLedger(id) {
  return request({
    url: `/ledger/${id}/compare`,
    method: 'get'
  })
}

export function getConfig() {
  return request({
    url: '/ledger/config',
    method: 'get'
  })
}
