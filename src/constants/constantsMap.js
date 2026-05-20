export const approvalScope = {
  'ALL': '全部',
  'ORG': '本部门',
  'NONE' : '无'
}

export const applicantType = {
  'SECTION_LEVEL_CADRE': '中层正职',
  'EMPLOYEE': '职工',
  'GENERAL_CADRE': '一般干部',
  'WORKSHOP_DIRECTOR': '车间主任'
}

export const leave_step = {
  1: ['ORG_PRINCIPAL','HR_SECTION_CHIEF','WORKSHOP_PARTY_SECRETARY'],
  2: 'HR_SECTION_CHIEF',
  3: ['ORG_PRINCIPAL','HR_SECTION_CHIEF','WORKSHOP_PARTY_SECRETARY'],
  4: ['STATIONMASTER', 'DEPUTY_STATIONMASTER'],
  5: ['PARTY_SECRETARY', 'STATIONMASTER','ORG_PRINCIPAL'],
  6: ['PARTY_SECRETARY','STATIONMASTER'],
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

export const actionMap = {
  'APPROVE': '同意',
  'REJECT': '驳回',
  'RETURN': '退回',
  'SUBMITTED': '提交',
}

export const STATUS_MAP = {
  DRAFT: { text: '草稿', color: 'default' },
  SUBMITTED: { text: '已提交', color: 'processing' },
  DIRECTOR_APPROVED: { text: '主任已审批', color: 'blue' },
  RETURNED: { text: '已退回', color: 'error' },
  APPROVED: { text: '已通过', color: 'success' },
  REJECTED: { text: '已拒绝', color: 'error' },
};

export const DEFAULT_CONFIG = {
  teamLeaderColor: '#FFFFCC',
  learnerColor: '#CCFFCC',
  newEmployeeColor: '#FFCCCC',
  showTeamLeaderColor: true,
  showLearnerColor: true,
  showNewEmployeeColor: true,
  showAge: true,
};
