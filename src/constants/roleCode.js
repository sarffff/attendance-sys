export const ApprovableRoleList = [
  'HR_SECTION_CHIEF', //这是劳动人事科科长  可以审批
  'ORG_PRINCIPAL', //这是车间负责人  可以审批
  'PARTY_SECRETARY', //党委书记 可以审批
  'STATIONMASTER', // 站长 可以审批
  'DEPUTY_STATIONMASTER', //主管站长 可以审批
  'WORKSHOP_PARTY_SECRETARY' //车间书记 可以审批
]

export const commonRoleList = [
  'ATTENDANCE_ADMIN', // 普通管理员
]

export const superRoleList = [
  'SYSTEM_ADMIN', //这是超级管理员,
]

export const allRoles = {
  'SYSTEM_ADMIN': '超级管理员',
  'ATTENDANCE_ADMIN': '普通管理员',
  'HR_SECTION_CHIEF': '劳动人事科科长',
  'ORG_PRINCIPAL': '车间负责人',
  'PARTY_SECRETARY': '党委书记',
  'STATIONMASTER': '站长',
  'DEPUTY_STATIONMASTER': '副站长',
  'WORKSHOP_PARTY_SECRETARY': '车间书记'
}

export const AllLedgerRoleList = [
  'ATTENDANCE_ADMIN',
  'HR_SECTION_CHIEF',
  'PARTY_SECRETARY',
  'STATIONMASTER',
  'DEPUTY_STATIONMASTER',
]
