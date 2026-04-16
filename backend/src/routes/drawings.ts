import { Router, Response } from 'express'
import multer from 'multer'
import { Drawing } from '../models'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.use(authenticate)

/**
 * GET /drawings — list all drawings for the authenticated user (no image data)
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const drawings = await Drawing.findAll({
        where: { userId: req.user.id },
        attributes: ['id', 'userId', 'sessionId', 'imageMimeType', 'createdAt'],
        order: [['createdAt', 'DESC']],
    })

    res.json({ drawings })
})

/**
 * GET /drawings/:id/download — serve image binary for a drawing owned by the user
 */
router.get('/:id/download', async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const drawing = await Drawing.findOne({
        where: { id: req.params.id, userId: req.user.id },
    })

    if (!drawing) {
        res.status(404).json({ error: 'Drawing not found' })
        return
    }

    res.setHeader('Content-Type', drawing.imageMimeType)
    res.setHeader('Content-Disposition', `attachment; filename="drawing-${drawing.id}.png"`)
    res.send(drawing.imageData)
})

/**
 * POST /drawings — save a canvas drawing without a session
 */
router.post('/', upload.single('image'), async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' })
        return
    }
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const sessionId = req.body.sessionId ? Number(req.body.sessionId) : null

    const newDrawing = await Drawing.create({
        userId: req.user.id,
        sessionId,
        imageData: req.file.buffer,
        imageMimeType: req.file.mimetype,
    })

    res.status(201).json({
        message: 'Saved canvas successfully',
        drawingId: newDrawing.id,
    })
})

export default router
