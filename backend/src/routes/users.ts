import { Router, Request, Response } from 'express'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'respond with a resource' })
})

export default router
