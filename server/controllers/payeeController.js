import{ validate }from 'jsonschema'

// import { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } from '../utils/constants.js'
import { createPayeeRequestSchema } from './schema/index.js'
import parseValidationErrors from '../utils/schemaValidation.js'
import { payeeService } from '../services/index.js'

export async function getPayeeRoot(req, res) {
	console.log('payee root')
	res.send('payee root')
}

export async function getPayeeById(req, res, next) {
	try{
		if (req.params.id === 'phoneNumber') {
			next()
		}
		// console.log('get payee by id')
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
		console.log('getting payee by id')
		// console.log(id)
		// console.log()
		var result = await payeeService.getPayeeById(id)
		if (Object.keys(result).length > 0) {
			let body = {
				id : result.id,
				firstName : result.first_name,
				lastName : result.last_name,
				phoneNumber : result.phone_number,
			}
			res.send(body)
		}
		else {
			res.send(result)
		}
		// res.send('got payee by id')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function getPayeeByPhoneNumber(req, res, next) {
	try{
		console.log('get payee by phone number')
		var phoneNumber = req.params.phoneNumber
		console.log(phoneNumber)

		// validate request
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		// process the request
		console.log('getting payee by phone number')
		// console.log(address)
		// console.log()
		var result = await payeeService.getPayeeByPhoneNumber(phoneNumber)
		// res.send('got payee by address')
		console.log(result)
		// res.send(result)
		if (Object.keys(result).length > 0) {
			let body = {
				id : result.id,
				firstName : result.first_name,
				lastName : result.last_name,
				phoneNumber : result.phone_number,
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



export async function createPayee(req, res, next) {
	try{
		var body = req.body
		var validationResult = validate(body, createPayeeRequestSchema)

		// validate request
		if (!validationResult.valid) throw parseValidationErrors(validationResult.errors)
		if (Object.keys(body).length > createPayeeRequestSchema.required.length) {
			throw ['request body must only have attributes: ' + createPayeeRequestSchema.required.join(', ')]
		}

		// process the request
		console.log('creating payee')
		// console.log(body)
		// console.log()
		await payeeService.createPayee(body)
		// res.send(response)
		res.send('created payee')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deletePayeeById(req, res, next) {
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
		console.log('deleting payee by id')
		await payeeService.deletePayeeById(id)
		res.send('deleted payee by id')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deletePayeeByPhoneNumber(req, res, next) {
	try{
		var phoneNumber = req.params.phoneNumber
		
		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		
		// process the request
		console.log('deleting payee by phoneNumber')
		await payeeService.deletePayeeByPhoneNumber(phoneNumber)
		res.send('deleted payee by phoneNumber')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}
