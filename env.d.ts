declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      channel_binding: string;
      sslmode: string;
      PORT: string;
      NODE_ENV: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      ALLOWED_ORIGINS: string;
      RATE_LIMIT_WINDOW_MS: string;
      RATE_LIMIT_MAX_REQUESTS: string;
      BCRYPT_SALT_ROUNDS: string;
      LOG_LEVEL: string;
    }
  }
}

export {};
