export enum Role {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user",
}

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  role?: Role;
}
