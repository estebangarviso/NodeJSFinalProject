import ROLES from '~/config/roles.json';
export const ROLE_IDS: string[] = Object.keys(ROLES);
export const ROLE_NAMES: string[] = Object.entries(ROLES).map((role) => role[1].name);
