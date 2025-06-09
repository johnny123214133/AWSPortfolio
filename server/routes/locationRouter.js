import express from 'express'
import { locationController } from '../controllers/index.js'

var router = express.Router()

router.get('/', locationController.getLocationRoot)
router.get('/:id', locationController.getLocationById)
router.get('/address/:address', locationController.getLocationByAddress)
router.get('/:lat/:lng', locationController.getLocationByLatLng)

router.post('/', locationController.createLocation)

router.delete('/:id', locationController.deleteLocationById)

export default router