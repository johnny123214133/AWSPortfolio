import { payeeRepository } from '../repositories/index.js'
import { paymentMethodService, paymentInteractionService } from './index.js'

export async function getPayeeById(id) {
	// Cases:
	// payee is in the database: return payee
	// payee is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await payeeRepository.getPayeeById(id)
	}
	catch (err) {
		throw err
	}
}

export async function getPayeeByPhoneNumber(phoneNumber) {
	// Cases:
	// payee is in the database: return payee
	// payee is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await payeeRepository.getPayeeByPhoneNumber(phoneNumber)
	}
	catch (err) {
		throw err
	}
}

export async function createPayee(body) {
	// Cases: 
	// payee is in the database: return 200 ok
	// payee is not in the database: add it, generate othe data, and return 201 created
	try {
		console.log('in create Payee')
		if (Object.keys(await payeeRepository.getPayeeByPhoneNumber(body.phoneNumber)).length == 0) {
			console.log('actually creating payee')
			await payeeRepository.createPayee(body)
			console.log('generating data for payee')
			await paymentMethodService.generatePaymentMethods(body.phoneNumber)
			console.log('generated pms for payee')
			await paymentInteractionService.generatePaymentInteraction(body.phoneNumber)
			console.log('done generating data')
		}
	}
	catch (err) {
		throw err
	}
}

export async function deletePayeeById(id) {
	// Cases:
	// payee is in the database: return payee
	// payee is not in the database: return 40x error
	try {
		await payeeRepository.deletePayeeById(id)
	}
	catch (err) {
		throw err
	}
}

export async function deletePayeeByPhoneNumber(phoneNumber) {
	// Cases:
	// payee is in the database: return payee
	// payee is not in the database: return 40x error
	try {
		await payeeRepository.deletePayeeByPhoneNumber(phoneNumber)
	}
	catch (err) {
		throw err
	}
}
