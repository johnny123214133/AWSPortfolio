import express from 'express'
import { startInteractionController } from '../controllers/index.js'

var router = express.Router()

router.get('/', startInteractionController.getStartInteractionRoot)
router.get('/:phoneNumber', startInteractionController.startInteraction)

export default router