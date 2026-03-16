import { Router } from 'express'
import { login, register } from '../controllers/authController.ts'
import { validatedBody } from '../middleware/validation.ts'
import { insertUserSchema } from '../db/schema.ts'
import z from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
const router = Router()

router.post('/register', validatedBody(insertUserSchema), register)
router.post('/login', validatedBody(loginSchema), login)
export default router
