import { Role } from "../RBAC/Role";

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  city: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}
