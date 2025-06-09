import { paymentInteractionRepository } from '../repositories/index.js'
import { payeeService, paymentMethodService, paymentInteractionService } from './index.js'

export async function startInteraction(phoneNumber) {
	console.log(phoneNumber)
	// trigger lambda to start interaction loop
	
	// start timer for 7 minutes, 420000 ms
	// destroy db entities once timer is out
	setTimeout(async () => {
		console.log(phoneNumber)
		await paymentInteractionService.deletePaymentInteractionByPhoneNumber(phoneNumber)
		await paymentMethodService.deletePaymentMethodsByPhoneNumber(phoneNumber)
		await payeeService.deletePayeeByPhoneNumber(phoneNumber)
	}, 420000)
	
	// destroy SNS topic for phoneNumber once timer is out

}