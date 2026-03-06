import express from 'express'

const app = express()

app.get('/health', (req, res) => {
  res.json({ message: 'Health route is working' })
  res.end('Hello there')
})

app.post('/cake', (req, res) => {})

export { app }
export default app
