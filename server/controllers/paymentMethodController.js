import{ validate }from 'jsonschema'

// import { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } from '../utils/constants.js'
import { createPaymentMethodRequestSchema } from './schema/index.js'
import parseValidationErrors from '../utils/schemaValidation.js'
import { paymentMethodService } from '../services/index.js'

export async function getPaymentMethodRoot(req, res) {
	console.log('Payment Method root')
	res.send('Payment Method root')
}

export async function getPaymentMethodById(req, res, next) {
	try{
		if (req.params.id === 'phoneNumber') {
			next()
		}
		// console.log('get paymentMethod by id')
		// console.log(req.params.id)
		var id = Number(req.params.id)
		// console.log(id)
		// send to get by address route since param is not just a number
		// if (isNaN(id)) next('route')

		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		// console.log('verifying id is integer')
		if (!Number.isInteger(id) || id < 1) {
			throw 'id must be an integer greater than 0'
		}

		// process the request
		console.log('getting payment method by id')
		// console.log(id)
		// console.log()
		var result = await paymentMethodService.getPaymentMethodById(id)
		// res.send('got paymentMethod by id')
		// res.send(result)
		if (Object.keys(result).length > 0) {
			let body = {
				id : result.id,
				payeePhoneNumber : result.payee_phone_number,
				accountNumber : result.account_number,
				pin : result.pin,
			}
			res.send(body)
		}
		else {
			res.send(result)
		}
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function getPaymentMethodsByPhoneNumber(req, res, next) {
	try{
		console.log('get paymentMethod by phone number')
		var phoneNumber = req.params.phoneNumber
		console.log(phoneNumber)

		// validate request
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		// process the request
		console.log('getting payment methods by phone number')
		// console.log(address)
		// console.log()
		var result = await paymentMethodService.getPaymentMethodsByPhoneNumber(phoneNumber)
		// res.send('got paymentMethod by address')
		console.log(result)
		// res.send(result)
		if (result.length > 0 && Object.keys(result[0]).length > 0) {
			let methods = []
			for (let i = 0; i < result.length; i++) {
				let body = {
					id : result[i].id,
					payeePhoneNumber : result[i].payee_phone_number,
					accountNumber : result[i].account_number,
					pin : result[i].pin,
				}
				methods.push(body)
			}
			res.send(methods)
		}
		else {
			res.send(result)
		}
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function getPaymentMethodByAccountNumberAndPhoneNumber(req, res, next) {
	try{
		var {accountNumber, phoneNumber} = req.params
		accountNumber = Number(accountNumber)
		

		console.log('get paymentMethod by account and phone number')
		console.log(accountNumber)
		console.log(phoneNumber)

		// validate request
		if (accountNumber < 1000 || accountNumber > 9999) {
			throw 'account number must be between 1000 and 9999'
		}
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		// process the request
		console.log('getting payment methods by phone number')
		// console.log(address)
		// console.log()
		var result = await paymentMethodService.getPaymentMethodByAccountNumberAndPhoneNumber(phoneNumber)
		// res.send('got paymentMethod by address')
		console.log(result)
		// res.send(result)
		if (Object.keys(result).length > 0) {
			let body = {
				id : result.id,
				payeePhoneNumber : result.payee_phone_number,
				accountNumber : result.account_number,
				pin : result.pin,
			}
			res.send(body)
		}
		else {
			res.send(result)
		}
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function createPaymentMethod(req, res, next) {
	try{
		var body = req.body
		var validationResult = validate(body, createPaymentMethodRequestSchema)

		// validate request
		if (!validationResult.valid) throw parseValidationErrors(validationResult.errors)
		if (Object.keys(body).length > createPaymentMethodRequestSchema.required.length) {
			throw ['request body must only have attributes: ' + createPaymentMethodRequestSchema.required.join(', ')]
		}

		// process the request
		console.log('creating paymentMethod')
		// console.log(body)
		// console.log()
		await paymentMethodService.createPaymentMethod(body)
		// res.send(response)
		res.send('created paymentMethod')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deletePaymentMethodById(req, res, next) {
	try{
		if (req.params.id === 'phoneNumber') {
			next()
		}
		var id = Number(req.params.id)
		
		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!Number.isInteger(id) || id < 1) {
			throw 'id must be an integer greater than 0'
		}
		
		// process the request
		console.log('deleting paymentMethod by id')
		await paymentMethodService.deletePaymentMethodById(id)
		res.send('deleted paymentMethod by id')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deletePaymentMethodsByPhoneNumber(req, res, next) {
	try{
		var phoneNumber = req.params.phoneNumber
		
		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		
		// process the request
		console.log('deleting paymentMethod by phoneNumber')
		await paymentMethodService.deletePaymentMethodsByPhoneNumber(phoneNumber)
		res.send('deleted paymentMethod by phoneNumber')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}
