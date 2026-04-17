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
        attributes: ['id', 'userId', 'sessionId', 'imageMimeType', 'fileName', 'createdAt'],
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
    const downloadName = drawing.fileName ? `${drawing.fileName}.png` : `drawing-${drawing.id}.png`
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`)
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

    const sessionId = req.body.sessionId || null
    const fileName = req.body.fileName || null

    const existingDrawing = await Drawing.findOne({
        where:{
            fileName: fileName,
            userId: req.user.id,
        }
    })

    if(existingDrawing){
        await existingDrawing.update({
            // sessionId: sessionId,
            imageData: req.file.buffer,
            imageMimeType: req.file.mimetype,
        })

        res.status(200).json({
            message: 'Updated existing canvas successfully',
            drawingId: existingDrawing.id,
        })
    }
    else{
        const newDrawing = await Drawing.create({
            userId: req.user.id,
            sessionId,
            imageData: req.file.buffer,
            imageMimeType: req.file.mimetype,
            fileName,
        })

        res.status(201).json({
            message: 'Saved canvas successfully',
            drawingId: newDrawing.id,
        })
    }

})

export default router
