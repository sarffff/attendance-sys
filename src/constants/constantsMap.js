export const approvalScope = {
  'ALL': '全部',
  'ORG': '本部门',
  'NONE': '无'
}

export const applicantType = {
  'SECTION_LEVEL_CADRE': '中层正职',
  'EMPLOYEE': '职工',
  'GENERAL_CADRE': '一般干部',
  'WORKSHOP_DIRECTOR': '车间主任'
}

export const leave_step = {
  1: ['ORG_PRINCIPAL', 'HR_SECTION_CHIEF', 'WORKSHOP_PARTY_SECRETARY'],
  2: 'HR_SECTION_CHIEF',
  3: ['ORG_PRINCIPAL', 'HR_SECTION_CHIEF', 'WORKSHOP_PARTY_SECRETARY'],
  4: ['STATIONMASTER', 'DEPUTY_STATIONMASTER'],
  5: ['PARTY_SECRETARY', 'STATIONMASTER', 'ORG_PRINCIPAL'],
  6: ['PARTY_SECRETARY', 'STATIONMASTER'],
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
  'OTHER': '其他'
}

export const SpecialLeaveTypes = ['年休假', '病假', '事假', '丧假', '搬家假']

export const leaderList = ['DEPUTY_STATIONMASTER', 'STATIONMASTER', 'PARTY_SECRETARY', 'HR_SECTION_CHIEF'];

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

export const LaborShifts = ['日勤制', '大日勤', '大四班', '小四班', '三班间歇制']

export const workType = [
  '车站值班员',
  '调车长',
  '减速顶维修工',
  '连结员',
  '保洁员',
  '助理值班员（外勤）',
  '驼峰作业员',
  '汽车驾驶员（小车）',
  '车站调度员',
  '铁路货运员（外勤）',
  '助理值班员（内勤）',
  '货运检查员',
  "铁路货运电动起重机司机（操作）",
  "驼峰值班员",
  "扳道员",
  "助理值班员（学习）",
  "车号员",
  "铁路通信工（普速通信综合维护）",
  "助理值班员（内外勤）",
  "货检值班员",
  "铁路货运员（内勤）",
  "铁路客运员",
  "计算机维修工",
  "充电工",
  "调车区长",
  "连结员（学习）",
  "铁路线路工（道口看守）",
  "电工",
  "服务员",
  "车站调度员（值班站长）",
  "炊事员",
  "核算员",
  "铁路售票员",
  "售票值班员",
  "客运值班员",
  "货装值班员",
  "货运安全员",
  "列尾作业员",
  "锅炉工",
  "巡守员",
  "客运计划员"

]
