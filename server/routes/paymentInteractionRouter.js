import express from 'express'
import { paymentInteractionController } from '../controllers/index.js'

var router = express.Router()

router.get('/', paymentInteractionController.getPaymentInteractionRoot)
router.get('/:id', paymentInteractionController.getPaymentInteractionById)
router.get('/phoneNumber/:phoneNumber', paymentInteractionController.getPaymentInteractionByPhoneNumber)

router.post('/', paymentInteractionController.createPaymentInteraction)

router.delete('/:id', paymentInteractionController.deletePaymentInteractionById)
router.delete('/phoneNumber/:phoneNumber', paymentInteractionController.deletePaymentInteractionByPhoneNumber)

export default router