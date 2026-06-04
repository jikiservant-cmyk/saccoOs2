export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SACCO_ADMIN: 'sacco_admin',
  MEMBER: 'member',
  SME_OWNER: 'business_owner'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES] | string;
export type Permission = string;
export const ROLE_PERMISSIONS = {} as Record<Role, Permission[]>;
