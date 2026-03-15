// /**
//  * @file env.ts
//  *
//  * Loads and validates environment variables for the application using `custom-env` and `zod`.
//  *
//  * - Sets `APP_STAGE` to 'dev' by default if not specified.
//  * - Loads environment variables based on the current `APP_STAGE`.
//  * - Defines a Zod schema (`envSchema`) for validating and coercing environment variables.
//  * - Parses and validates `process.env` against the schema, exiting the process if validation fails.
//  * - Exports the validated environment variables as `env` (and default export).
//  * - Provides utility functions (`isProd`, `isDev`, `isTest`) to check the current application stage.
//  *
//  * @remarks
//  * This module ensures that all required environment variables are present and valid at runtime,
//  * preventing the application from starting with invalid configuration.
//  *
//  * @exports
//  * - `env`: The validated environment variables.
//  * - `isProd`: Function to check if the app is running in production stage.
//  * - `isDev`: Function to check if the app is running in development stage.
//  * - `isTest`: Function to check if the app is running in test stage.
//  * - Default export: `env`
//  */
// import { env as loadEnv } from 'custom-env'
// import { z } from 'zod'

// process.env.APP_STAGE = process.env.APP_STAGE || 'dev'

// const isProduction = process.env.APP_STAGE === 'production'
// const isDevelopment = process.env.APP_STAGE === 'dev'
// const isTesting = process.env.APP_STAGE === 'test'

// loadEnv(process.env.APP_STAGE)

// const envSchema = z.object({
//   NODE_ENV: z
//     .enum(['development', 'test', 'production'])
//     .default('development'),

//   APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),

//   PORT: z.coerce.number().positive().default(3000),
//   DATABASE_URL: z.string().startsWith('postgresql://'),
//   // JWT_SECRET: z.string().min(32, 'Must be 32 chars long'),
//   JWT_EXPIRES_IN: z.string().default('7d'),
//   BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
// })

// export type Env = z.infer<typeof envSchema> // automatically generate a static TypeScript type based on a runtime Zod validation schema.
// let env: Env

// try {
//   env = envSchema.parse(process.env)
// } catch (e) {
//   if (e instanceof z.ZodError) {
//     console.log('Invalid env var')
//     console.error(JSON.stringify(e.flatten().fieldErrors, null, 2))

//     e.issues.forEach((err) => {
//       const path = err.path.join('.')
//       console.log(`${path}: ${err.message}`)
//     })

//     process.exit(1)
//   }

//   throw e
// }

// export const isProd = () => env.APP_STAGE === 'production'
// export const isDev = () => env.APP_STAGE === 'dev'
// export const isTest = () => env.APP_STAGE === 'test'

// export { env }
// export default env
// src/env.ts   (or wherever you had the previous file)

import 'dotenv-flow/config' // ← This one line loads everything automatically
// It uses process.env.NODE_ENV to decide which .env.* files to load

import { z } from 'zod'

// Optional: force fallback if NODE_ENV is missing
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// You can keep APP_STAGE if you really want, but most people just use NODE_ENV
// Here we map your old APP_STAGE → NODE_ENV for compatibility
if (process.env.APP_STAGE && !process.env.NODE_ENV) {
  const stageMap: Record<string, string> = {
    dev: 'development',
    test: 'test',
    production: 'production',
  }
  process.env.NODE_ENV = stageMap[process.env.APP_STAGE] || 'development'
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // You can keep APP_STAGE if needed, but consider deprecating it later
  APP_STAGE: z.enum(['dev', 'test', 'production']).optional(),

  PORT: z.coerce.number().positive().default(3000),

  DATABASE_URL: z.string().url().startsWith('postgres'),

  JWT_SECRET: z.string().min(44).describe('Used for signing JWTs'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(16).default(12),

  // Add more variables here as your app grows
  // e.g. REDIS_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

let env: Env

try {
  env = envSchema.parse(process.env)
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:')
    const fieldErrors = e.flatten().fieldErrors
    console.error(JSON.stringify(fieldErrors, null, 2))

    // Nicer per-field logging
    e.issues.forEach((issue) => {
      const path = issue.path.join('.')
      console.error(`  → ${path}: ${issue.message}`)
    })

    console.error('\nPlease fix the .env file(s) and restart.')
    process.exit(1)
  }
  throw e
}

// Helper functions (you can keep your old names or switch to NODE_ENV style)
export const isProd = () => env.NODE_ENV === 'production'
export const isDev = () => env.NODE_ENV === 'development'
export const isTest = () => env.NODE_ENV === 'test'

// Optional: keep old names for gradual migration
export const isProduction = isProd
export const isDevelopment = isDev
export const isTesting = isTest

export { env }
export default env
