import USER_ROLE from "../../constants/userRole";

export interface TUser {
  email: string;
  password: string;
  name: string;
  address?: string;
  role: "user" | "admin";
  status: "in-progress" | "blocked";
  isDeleted: boolean;
  passwordChangedAt?: Date;
}

export type TUserRole = keyof typeof USER_ROLE;
