import { Router } from 'express'
import { register } from '../controllers/authController.ts'
import { validatedBody } from '../middleware/validation.ts'
import { insertUserSchema } from '../db/schema.ts'

const router = Router()

router.post('/register', validatedBody(insertUserSchema), register)
router.post('/login', (req, res) => {
  res.json({ message: 'user logged in' }).status(201)
})
export default router
