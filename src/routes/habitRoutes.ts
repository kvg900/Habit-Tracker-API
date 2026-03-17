import { Router } from 'express'
import { validatedBody, validateParams } from '../middleware/validation.ts'
import { z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'
import {
  createHabit,
  deleteHabit,
  getHabitById,
  getUserHabits,
  updateHabit,
} from '../controllers/habitController.ts'

const createHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.number(),
  tagIds: z.array(z.string()).optional(),
})
const createParamsSchema = z.object({
  id: z.string(),
})

const router = Router()
router.use(authenticateToken)

router.get('/', getUserHabits)

router.patch('/:id', updateHabit)

router.get('/:id', validateParams(createParamsSchema), getHabitById)

router.post('/', validatedBody(createHabitSchema), createHabit)

router.delete('/:id', deleteHabit)

export default router
