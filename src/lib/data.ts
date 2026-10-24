export const AUTH_PATHS = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  CALLBACK: "/auth/callback",
} as const;

export const APP_PATHS = {
  HOME: "/",
} as const;

export const API_PATHS = {
  VOICE_TOKEN: "/api/voice/token",
} as const;
