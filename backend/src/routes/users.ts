import { Router, Response } from 'express'
import { Op } from 'sequelize'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'
import User from '../models/User'

const router = Router()

// GET /users — list all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, search } = req.query
    const where: any = {}

    if (role && ['admin', 'instructor', 'student'].includes(role as string)) {
      where.role = role
    }

    if (search && typeof search === 'string' && search.trim()) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
      ]
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'ASC']],
    })

    res.json({ users })
  } catch (err) {
    console.error('List users error:', err)
    res.status(500).json({ error: 'Failed to list users' })
  }
})

// PATCH /users/:id/role — change a user's role (admin only)
router.patch('/:id/role', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id)
    const { role } = req.body

    if (!role || !['admin', 'instructor', 'student'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be admin, instructor, or student' })
      return
    }

    // Prevent self-demotion
    if (req.user?.id === userId) {
      res.status(403).json({ error: 'Cannot change your own role' })
      return
    }

    const user = await User.findByPk(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    user.role = role
    await user.save()

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Change role error:', err)
    res.status(500).json({ error: 'Failed to change role' })
  }
})

// DELETE /users/:id — delete a user (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id)

    // Prevent self-deletion
    if (req.user?.id === userId) {
      res.status(403).json({ error: 'Cannot delete your own account' })
      return
    }

    const user = await User.findByPk(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    await user.destroy()
    res.json({ message: 'User deleted' })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router
