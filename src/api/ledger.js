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
export function exportBasic(orgUnitId, extraParams = {}) {
  return request({
    url: '/ledger/basic/export',
    method: 'get',
    params: { orgUnitId, ...extraParams },
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

//获取我的台账列表
export function getMyLedger(month) {
  return request({
    url: '/ledger/my',
    method: 'get',
    params: { month }
  })
}

//保存台账详情
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
export function submitLedger(data) {
  return request({
    url: '/ledger/submit',
    method: 'post',
    data
  })
}

//获取待审核的台账
export function getPendingLedgers(params) {
  return request({
    url: '/ledger/pending',
    method: 'get',
    params
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

//获取台账配置
export function getConfig() {
  return request({
    url: '/ledger/config',
    method: 'get'
  })
}

//提交现员表到人事科
export function submitBasic() {
  return request({
    url: 'ledger/basic/submit',
    method: 'post',
  })
}

//导出按班别分列的现员分布台账Excel
export function exportLedgerExcelByClass(id) {
  return request({
    url: `/ledger/${id}/distribution-excel`,
    method: 'get',
    responseType: 'blob'
  })
}

//各部门现员表提交状态
export function getSubmitStatus(params) {
  return request({
    url: '/ledger/basic/submissions',
    method: 'get',
    params
  })
}


//批量导出现员表
export function exportBasicBatch(orgUnitIds) {
  return request({
    url: '/ledger/basic/batch-export',
    method: 'post',
    data: { orgUnitIds },
    responseType: 'blob'
  })
}

//批量导出现员台账表
export function exportLedgerBatch(orgUnitIds) {
  return request({
    url: '/ledger/batch-export',
    method: 'post',
    data: { orgUnitIds },
    responseType: 'blob'
  })
}

//获取车间台账模板
export function getLedgerTemplate(orgUnitId) {
  return request({
    url: `ledger/template-fields/${orgUnitId}`,
    method: 'get'
  })
}

//按模板导出台账excel
export function exportLedgerExcelByTemplate(id) {
  return request({
    url: `/ledger/${id}/template-excel`,
    method: 'get',
    responseType: 'blob'
  })
}

//下载台账模板
export function downloadLedgerTemplate(orgUnitId) {
  return request({
    url: `/ledger/template/download/${orgUnitId}`,
    method: 'get',
    responseType: 'blob'
  })
}

//上传台账模板
export function uploadLedgerTemplate(orgUnitId, file) {
  return request({
    url: `/ledger/template/upload/${orgUnitId}`,
    method: 'post',
    data: file
  })
}

//分发台账给领导查看
export function distributeLedgerToLeaders(ledgerIds, targetUserIds) {
  return request({
    url: '/ledger/share',
    method: 'post',
    data: { ledgerIds, targetUserIds }
  })
}

//获取领导可查看台账
export function getSharedLedgers() {
  return request({
    url: '/ledger/shared-with-me',
    method: 'get'
  })
}

//撤销分发台账
export function revokeShareLedger(ledgerId, targetUserId) {
  return request({
    url: '/ledger/share',
    method: 'delete',
    params: { ledgerId, targetUserId }
  })
}

//获取领导列表
export function getLeaders() {
  return request({
    url: '/ledger/leaders',
    method: 'get'
  })
}