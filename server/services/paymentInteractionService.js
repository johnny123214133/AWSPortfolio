import { paymentInteractionRepository } from '../repositories/index.js'
import { paymentMethodService } from './index.js'
import { generateFourDigitNumber } from '../utils/functions.js'

export async function getPaymentInteractionById(id) {
	// Cases:
	// paymentInteraction is in the database: return paymentInteraction
	// paymentInteraction is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await paymentInteractionRepository.getPaymentInteractionById(id)
	}
	catch (err) {
		throw err
	}
}

export async function getPaymentInteractionByPhoneNumber(phoneNumber) {
	console.log('getting pi by phone number ' + phoneNumber)
	// Cases:
	// paymentInteraction is in the database: return paymentInteraction
	// paymentInteraction is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await paymentInteractionRepository.getPaymentInteractionByPhoneNumber(phoneNumber)
	}
	catch (err) {
		throw err
	}
}

export async function createPaymentInteraction(body) {
	// Cases: 
	// paymentInteraction is in the database: return 200 ok
	// paymentInteraction is not in the database: add it and return 201 created
	try {
		if (Object.keys(await paymentInteractionRepository.getPaymentInteractionByPhoneNumber(body.payeePhoneNumber)).length == 0) {
			await paymentInteractionRepository.createPaymentInteraction(body)
		}
	}
	catch (err) {
		throw err
	}
}

export async function generatePaymentInteraction(phoneNumber) {
	console.log('payment methods to pick from:')
	console.log(await paymentMethodService.getPaymentMethodsByPhoneNumber(phoneNumber))
	let body = {
		payeePhoneNumber : phoneNumber,
		currentPaymentMethodId : (await paymentMethodService.getPaymentMethodsByPhoneNumber(phoneNumber))[0]['id'],
		billId : generateFourDigitNumber(),
		state : 'InteractionInitiated',
		invalidResponseCounter : 4
	}
	console.log('BODY')
	console.log(body)
	await createPaymentInteraction(body)
	console.log('created payment interaction')
}

export async function deletePaymentInteractionById(id) {
	// Cases:
	// paymentInteraction is in the database: return paymentInteraction
	// paymentInteraction is not in the database: return 40x error
	try {
		await paymentInteractionRepository.deletePaymentInteractionById(id)
	}
	catch (err) {
		throw err
	}
}

export async function deletePaymentInteractionByPhoneNumber(phoneNumber) {
	// Cases:
	// paymentInteraction is in the database: return paymentInteraction
	// paymentInteraction is not in the database: return 40x error
	try {
		await paymentInteractionRepository.deletePaymentInteractionByPhoneNumber(phoneNumber)
	}
	catch (err) {
		throw err
	}
}
