import express from 'express'
import { paymentMethodController } from '../controllers/index.js'

var router = express.Router()

router.get('/', paymentMethodController.getPaymentMethodRoot)
router.get('/:id', paymentMethodController.getPaymentMethodById)
router.get('/phoneNumber/:phoneNumber', paymentMethodController.getPaymentMethodsByPhoneNumber)
router.get('/:accountNumber/:phoneNumber', paymentMethodController.getPaymentMethodByAccountNumberAndPhoneNumber)

router.post('/', paymentMethodController.createPaymentMethod)

router.delete('/:id', paymentMethodController.deletePaymentMethodById)
router.delete('/phoneNumber/:phoneNumber', paymentMethodController.deletePaymentMethodsByPhoneNumber)

export default router