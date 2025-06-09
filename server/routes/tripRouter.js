import express from 'express'
import { tripController } from '../controllers/index.js'

var router = express.Router()

router.get('/', tripController.getTripRoot)
router.get('/:id', tripController.getTripById)
router.get('/:routeId/:startTime', tripController.getTripByRouteAndStartTime)
router.get('/:routeId/:startTime/:numTrips', tripController.getSomeTrips)

router.post('/', tripController.createTrip)

router.delete('/:id', tripController.deleteTripById)

export default router