import type { Request, Response } from 'express'
import db from '../db/connection.ts'
import { users, type NewUsers } from '../db/schema.ts'
import { generateToken } from '../utils/jwt.ts'
import env from '../../env.ts'
import { hashPassword } from '../utils/passwords.ts'

// creating a controller for user registration

/**
 * Handles user registration.
 *
 * @param req - Express request object containing user registration data in `body`.
 * @param res - Express response object used to send back the result.
 *
 * Steps:
 * 1. Extracts `email`, `username`, `password`, `firstname`, and `lastName` from the request body.
 * 2. Determines the number of bcrypt salt rounds from environment variable `BCRYPT_SALT_ROUNDS`, defaulting to 12 if not set.
 * 3. Hashes the user's password using bcrypt for secure storage.
 * 4. Inserts the new user into the database with the hashed password and other provided details.
 * 5. Retrieves the newly created user's information (excluding password) from the database.
 * 6. Generates a JWT token for the new user to enable immediate login.
 * 7. Sends a 201 response with a success message, the new user's data, and the JWT token.
 * 8. If any error occurs during registration, logs the error and sends a 500 response with an error message.
 *
 * This function ensures secure password handling, immediate authentication, and robust error management during user registration.
 */
export const register = async (
  req: Request<any, any, NewUsers>,
  res: Response,
) => {
  try {
    // const { email, username, password, firstname, lastName } = req.body

    // Hash password with configurable rounds
    const hashedPassword = await hashPassword(req.body.password)

    // Create user in database
    const [newUser] = await db
      .insert(users)
      .values({
        ...req.body,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstname: users.firstname,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })

    // Generate JWT for auto-login
    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    })

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      token, // User is logged in immediately
    })
  } catch (e) {
    console.log('Registration error : ', e)
    res.status(500).json({ error: 'User creation failed' })
  }
}
