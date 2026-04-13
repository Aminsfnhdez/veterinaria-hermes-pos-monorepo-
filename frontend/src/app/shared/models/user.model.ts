export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'VENDEDOR';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}