import { paymentMethodRepository } from '../repositories/index.js'
import { generateFourDigitNumber } from '../utils/functions.js'

export async function getPaymentMethodById(id) {
	// Cases:
	// paymentMethod is in the database: return paymentMethod
	// paymentMethod is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await paymentMethodRepository.getPaymentMethodById(id)
	}
	catch (err) {
		throw err
	}
}

export async function getPaymentMethodsByPhoneNumber(phoneNumber) {
	// Cases:
	// paymentMethod is in the database: return paymentMethod
	// paymentMethod is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await paymentMethodRepository.getPaymentMethodsByPhoneNumber(phoneNumber)
	}
	catch (err) {
		throw err
	}
}

export async function getPaymentMethodByAccountNumberAndPhoneNumber(accountNumber, phoneNumber) {
	// Cases:
	// paymentMethod is in the database: return paymentMethod
	// paymentMethod is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await paymentMethodRepository.getPaymentMethodByAccountNumberAndPhoneNumber(accountNumber, phoneNumber)
	}
	catch (err) {
		throw err
	}
}

export async function createPaymentMethod(body) {
	// Cases: 
	// paymentMethod is in the database: return 200 ok
	// paymentMethod is not in the database: add it and return 201 created
	try {
		console.log('in createPaymentMethod method')
		console.log(body)
		if (Object.keys(await paymentMethodRepository.getPaymentMethodByAccountNumberAndPhoneNumber(body.accountNumber, body.payeePhoneNumber)).length == 0) {
			console.log('creating payment method')
			await paymentMethodRepository.createPaymentMethod(body)
			console.log('created payment method')
		}
	}
	catch (err) {
		throw err
	}
}

export async function generatePaymentMethods(phoneNumber) {
	// build body, then call createPaymentMethod
	for (let i = 0; i < 3; i++) {
		console.log('loop ' + (i + 1))
		let body = {
			payeePhoneNumber : phoneNumber,
			accountNumber : generateFourDigitNumber(),
			pin : generateFourDigitNumber()
		}
		await createPaymentMethod(body)
	}
	console.log('done looping')
}

export async function deletePaymentMethodById(id) {
	// Cases:
	// paymentMethod is in the database: return paymentMethod
	// paymentMethod is not in the database: return 40x error
	try {
		await paymentMethodRepository.deletePaymentMethodById(id)
	}
	catch (err) {
		throw err
	}
}

export async function deletePaymentMethodsByPhoneNumber(phoneNumber) {
	console.log(phoneNumber)
	// Cases:
	// paymentMethod is in the database: return paymentMethod
	// paymentMethod is not in the database: return 40x error
	try {
		await paymentMethodRepository.deletePaymentMethodsByPhoneNumber(phoneNumber)
	}
	catch (err) {
		throw err
	}
}
