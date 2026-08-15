import express from 'express'
import { payeeController } from '../controllers/index.js'

var router = express.Router()

router.get('/', payeeController.getPayeeRoot)
router.get('/:id', payeeController.getPayeeById)
router.get('/phoneNumber/:phoneNumber', payeeController.getPayeeByPhoneNumber)

router.post('/', payeeController.createPayee)

router.delete('/:id', payeeController.deletePayeeById)
router.delete('/phoneNumber/:phoneNumber', payeeController.deletePayeeByPhoneNumber)

export default router