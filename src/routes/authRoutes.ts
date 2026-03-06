import { Router } from 'express'

const router = Router()

router.post('/register', (req, res) => {
  res.json({ message: 'user signed up' }).status(201)
})
router.post('/login', (req, res) => {
  res.json({ message: 'user logged in' }).status(201)
})
export default router
