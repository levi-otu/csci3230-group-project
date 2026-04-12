import { Router, Response } from 'express'
import { Op } from 'sequelize'
import { Session, SessionParticipant, User } from '../models'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = Router()

// All routes require an authenticated user
router.use(authenticate)

/**
 * GET /sessions
 * Query params:
 *   status   — filter by status (scheduled, active, completed, cancelled)
 *   topic    — filter by topic
 *   mine     — true: only sessions created or joined by the current user
 *   upcoming — true: only sessions with scheduled_at in the future
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  const { status, topic, mine, upcoming } = req.query
  const where: Record<string, unknown> = {}

  if (status) where.status = status
  if (topic) where.topic = topic
  if (upcoming === 'true') {
    where.scheduledAt = { [Op.gte]: new Date() }
  }

  const include: object[] = [
    { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] },
    { model: User, as: 'participants', attributes: ['id', 'username', 'email', 'role'], through: { attributes: [] } },
  ]

  let sessions = await Session.findAll({
    where,
    include,
    order: [['scheduledAt', 'ASC']],
  })

  if (mine === 'true' && req.user) {
    const userId = req.user.id
    sessions = sessions.filter(
      (s) =>
        s.createdBy === userId ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s as any).participants?.some((p: { id: number }) => p.id === userId),
    )
  }

  res.json({ sessions })
})

/**
 * GET /sessions/:id — fetch a single session with creator and participants
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const session = await Session.findByPk(req.params.id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username', 'email', 'role'] },
      { model: User, as: 'participants', attributes: ['id', 'username', 'email', 'role'], through: { attributes: [] } },
    ],
  })

  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  res.json({ session })
})

/**
 * POST /sessions — create a session (instructors and admins only)
 */
router.post('/', authorize('instructor', 'admin'), async (req: AuthRequest, res: Response) => {
  const { title, description, topic, scheduledAt, durationMinutes, maxParticipants } = req.body

  if (!title || !topic || !scheduledAt) {
    res.status(400).json({ error: 'title, topic, and scheduledAt are required' })
    return
  }

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const session = await Session.create({
    title,
    description: description ?? null,
    topic,
    scheduledAt: new Date(scheduledAt),
    durationMinutes: durationMinutes ?? 60,
    maxParticipants: maxParticipants ?? null,
    createdBy: req.user.id,
    status: 'scheduled',
  })

  res.status(201).json({ session })
})

/**
 * PUT /sessions/:id — update a session
 * Owner or admin only
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const session = await Session.findByPk(req.params.id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const isOwner = session.createdBy === req.user.id
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Forbidden: only the session owner or an admin can edit' })
    return
  }

  const { title, description, topic, scheduledAt, durationMinutes, maxParticipants } = req.body
  if (title !== undefined) session.title = title
  if (description !== undefined) session.description = description
  if (topic !== undefined) session.topic = topic
  if (scheduledAt !== undefined) session.scheduledAt = new Date(scheduledAt)
  if (durationMinutes !== undefined) session.durationMinutes = durationMinutes
  if (maxParticipants !== undefined) session.maxParticipants = maxParticipants

  await session.save()
  res.json({ session })
})

/**
 * DELETE /sessions/:id — delete a session
 * Owner or admin only
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const session = await Session.findByPk(req.params.id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const isOwner = session.createdBy === req.user.id
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Forbidden: only the session owner or an admin can delete' })
    return
  }

  await session.destroy()
  res.status(204).end()
})

/**
 * POST /sessions/:id/join — students join a session
 */
router.post('/:id/join', authorize('student'), async (req: AuthRequest, res: Response) => {
  const session = await Session.findByPk(req.params.id, {
    include: [{ model: User, as: 'participants', through: { attributes: [] } }],
  })

  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  if (session.status === 'completed' || session.status === 'cancelled') {
    res.status(400).json({ error: 'Cannot join a completed or cancelled session' })
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participants = (session as any).participants as Array<{ id: number }>
  if (session.maxParticipants && participants.length >= session.maxParticipants) {
    res.status(400).json({ error: 'Session is full' })
    return
  }

  const [, created] = await SessionParticipant.findOrCreate({
    where: { sessionId: session.id, userId: req.user.id },
  })

  res.status(created ? 201 : 200).json({ joined: true })
})

/**
 * DELETE /sessions/:id/leave — student leaves a session
 */
router.delete('/:id/leave', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const removed = await SessionParticipant.destroy({
    where: { sessionId: req.params.id, userId: req.user.id },
  })

  if (removed === 0) {
    res.status(404).json({ error: 'Not a participant of this session' })
    return
  }

  res.status(204).end()
})

/**
 * PATCH /sessions/:id/status — change session status (start/end/cancel)
 * Owner or admin only
 */
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  const { status } = req.body
  const validStatuses = ['scheduled', 'active', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `status must be one of ${validStatuses.join(', ')}` })
    return
  }

  const session = await Session.findByPk(req.params.id)
  if (!session) {
    res.status(404).json({ error: 'Session not found' })
    return
  }

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const isOwner = session.createdBy === req.user.id
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Forbidden: only the session owner or an admin can change status' })
    return
  }

  session.status = status
  await session.save()
  res.json({ session })
})

export default router
