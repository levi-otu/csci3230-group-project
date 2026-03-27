import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { UniqueConstraintError } from 'sequelize'
import { User } from '../models'
import { generateToken, authenticate, AuthRequest, AuthPayload } from '../middleware/auth'

const router = Router()

const SALT_ROUNDS = 10

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body

  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required' })
    return
  }

  const validRoles: AuthPayload['role'][] = ['admin', 'instructor', 'student']
  const userRole = validRoles.includes(role) ? role : 'student'

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  try {
    const user = await User.create({
      username,
      email,
      passwordHash,
      role: userRole,
    })

    const token = generateToken({ id: user.id, username: user.username, role: user.role })
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    })
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const fields = Object.keys(err.fields || {})
      if (fields.includes('username')) {
        res.status(409).json({ error: 'Username already exists' })
      } else if (fields.includes('email')) {
        res.status(409).json({ error: 'Email already exists' })
      } else {
        res.status(409).json({ error: 'Duplicate entry' })
      }
      return
    }
    throw err
  }
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' })
    return
  }

  const user = await User.findOne({ where: { username } })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = generateToken({ id: user.id, username: user.username, role: user.role })
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  })
})

// GET /auth/me — get current user from token
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

export default router
