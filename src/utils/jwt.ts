import { jwtVerify, SignJWT } from 'jose'
import { createSecretKey } from 'crypto'
import env from '../../env.ts'

export interface JwtPayload {
  id: string
  email: string
  username: string
}

/**
 * Generates a signed JWT token using the provided payload.
 *
 * @param payload - The payload to be included in the JWT token.
 *
 * Steps:
 * 1. Retrieves the JWT secret from environment variables.
 * 2. Creates a cryptographic secret key using the secret and UTF-8 encoding.
 * 3. Initializes a new JWT with the given payload.
 * 4. Sets the protected header specifying the algorithm as HS256.
 * 5. Sets the issued-at timestamp to the current time.
 * 6. Sets the expiration time for the token, defaulting to 7 days if not specified.
 * 7. Signs the JWT using the generated secret key and returns the token as a promise.
 *
 * @returns A promise that resolves to the signed JWT token as a string.
 */
export const generateToken = (payload: JwtPayload): Promise<string> => {
  const secret = env.JWT_SECRET
  const secretKey = createSecretKey(secret, 'utf-8')

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
    .sign(secretKey)
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8')
  const { payload } = await jwtVerify(token, secretKey)

  return {
    id: payload.id as string,
    email: payload.email as string,
    username: payload.username as string,
  }
}
