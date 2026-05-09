export const approvalScope = {
  'ALL': '全部',
  'ORG': '本部门',
  'NONE' : '无'
}

export const applicantType = {
  'SECTION_LEVEL_CADRE': '中层正职',
  'EMPLOYEE': '职工',
  'GENERAL_CADRE': '一般干部'
}

export const leave_step = {
  1: ['ORG_PRINCIPAL','HR_SECTION_CHIEF'],
  2: 'HR_SECTION_CHIEF',
  3: ['ORG_PRINCIPAL','HR_SECTION_CHIEF'],
  4: ['STATIONMASTER', 'DEPUTY_STATIONMASTER'],
  5: ['PARTY_SECRETARY', 'STATIONMASTER','ORG_PRINCIPAL'],
  6: 'PARTY_SECRETARY',
  99: 'ORG_PRINCIPAL'
}

export const orgMap = {
  'DEPARTMENT': '部门',
  'WORKSHOP': '车间'
}

export const leaveStatusMap = {
  PENDING: { color: "orange", text: "待审批" },
  APPROVING: { color: "blue", text: "审批中" },
  APPROVED: { color: "green", text: "已通过" },
  REJECTED: { color: "red", text: "已驳回" },
  CANCELLED: { color: "gray", text: "已撤销" },
}

export const leaveScopeMap = {
  'ALL': '全部',
  'PERSONAL': '事假',
  'SICK': '病假',
  'OTHER' : '其他'
}

export const SpecialLeaveTypes = ['年休假', '病假', '事假', '丧假', '搬家假']

export const leaderList = ['DEPUTY_STATIONMASTER', 'STATIONMASTER', 'PARTY_SECRETARY'];
