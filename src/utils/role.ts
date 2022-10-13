import _ROLES from '../import/roles.json'
export const ROLES = _ROLES
export const ROLE_IDS: string[] = Object.entries(ROLES).map(role =>
  String(role[1].id)
)
export const ROLE_NAMES: string[] = Object.entries(ROLES).map(
  role => role[1].name
)
// eslint-disable-next-line
export type ROLE_NAMES = 'salesman' | 'customer'
export type ROLES_IDS = 1 | 2
