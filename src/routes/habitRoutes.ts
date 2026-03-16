import { Router } from 'express'
import { validatedBody, validateParams } from '../middleware/validation.ts'
import { z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'

const createHabitSchema = z.object({
  name: z.string(),
})
const createParamsSchema = z.object({
  id: z.string(),
})

const router = Router()
router.use(authenticateToken)

router.get('/', (req, res) => {
  res.json({ message: 'habits' })
})

router.get('/:id', validateParams(createParamsSchema), (req, res) => {
  res.json({ message: 'get one habit' })
})

router.post('/', validatedBody(createHabitSchema), (req, res) => {
  res.json({ message: 'created habit' })
})

router.delete('/:id', (req, res) => {
  res.json({ message: 'deleted habit' })
})

export default router
