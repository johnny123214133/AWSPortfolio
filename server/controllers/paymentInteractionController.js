import{ validate }from 'jsonschema'

// import { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } from '../utils/constants.js'
import { createPaymentInteractionRequestSchema } from './schema/index.js'
import parseValidationErrors from '../utils/schemaValidation.js'
import { paymentInteractionService } from '../services/index.js'

export async function getPaymentInteractionRoot(req, res) {
	console.log('Payment Interaction root')
	res.send('Payment Interaction root')
}

export async function getPaymentInteractionById(req, res, next) {
	try{
		if (req.params.id === 'phoneNumber') {
			next()
		}
		// console.log('get paymentInteraction by id')
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
		console.log('getting payment Interaction by id')
		// console.log(id)
		// console.log()
		var result = await paymentInteractionService.getPaymentInteractionById(id)
		// res.send('got paymentInteraction by id')
		// res.send(result)
		if (Object.keys(result).length > 0) {
			let body = {
				id : result.id,
				payeePhoneNumber : result.payee_phone_number,
				currentPaymentMethodId : result.current_payment_method_id,
				billId : result.bill_id,
				state : result.state,
				invalidResponseCounter : result.invalid_response_counter,
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

export async function getPaymentInteractionByPhoneNumber(req, res, next) {
	try{
		console.log('get paymentInteraction by phone number')
		var phoneNumber = req.params.phoneNumber
		console.log(phoneNumber)

		// validate request
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		// process the request
		console.log('getting payment Interaction by phone number')
		// console.log(address)
		// console.log()
		var result = await paymentInteractionService.getPaymentInteractionByPhoneNumber(phoneNumber)
		// res.send('got paymentInteraction by address')
		console.log(result)
		// res.send(result)
		if (Object.keys(result).length > 0) {
			let body = {
				id : result.id,
				payeePhoneNumber : result.payee_phone_number,
				currentPaymentMethodId : result.current_payment_method_id,
				billId : result.bill_id,
				state : result.state,
				invalidResponseCounter : result.invalid_response_counter,
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


export async function createPaymentInteraction(req, res, next) {
	try{
		var body = req.body
		var validationResult = validate(body, createPaymentInteractionRequestSchema)

		// validate request
		if (!validationResult.valid) throw parseValidationErrors(validationResult.errors)
		if (Object.keys(body).length > createPaymentInteractionRequestSchema.required.length) {
			throw ['request body must only have attributes: ' + createPaymentInteractionRequestSchema.required.join(', ')]
		}

		// process the request
		console.log('creating paymentInteraction')
		// console.log(body)
		// console.log()
		await paymentInteractionService.createPaymentInteraction(body)
		// res.send(response)
		res.send('created paymentInteraction')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deletePaymentInteractionById(req, res, next) {
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
		console.log('deleting paymentInteraction by id')
		await paymentInteractionService.deletePaymentInteractionById(id)
		res.send('deleted paymentInteraction by id')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deletePaymentInteractionByPhoneNumber(req, res, next) {
	try{
		var phoneNumber = req.params.phoneNumber
		
		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		
		// process the request
		console.log('deleting paymentInteraction by phoneNumber')
		await paymentInteractionService.deletePaymentInteractionByPhoneNumber(phoneNumber)
		res.send('deleted paymentInteraction by phoneNumber')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}
