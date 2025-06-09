import express from 'express'
import { routeController } from '../controllers/index.js'

var router = express.Router()

router.get('/', routeController.getRouteRoot)
router.get('/:id', routeController.getRouteById)
router.get('/:originId/:destId', routeController.getRouteByOriginAndDestination)

router.post('/', routeController.createRoute)

router.delete('/:id', routeController.deleteRouteById)

export default router