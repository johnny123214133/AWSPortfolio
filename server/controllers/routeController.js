import{ validate }from 'jsonschema'

import { createRouteRequestSchema } from './schema/index.js'
import parseValidationErrors from '../utils/schemaValidation.js'
import { routeService } from '../services/index.js'

export async function getRouteRoot(req, res, next) {
	console.log('route root')
	res.send('route root')
}

export async function getRouteById(req, res, next) {
	try{
		var id = Number(req.params.id)

		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!Number.isInteger(id) || id < 1) {
			throw 'id must be an integer greater than 0'
		}

		// process the request
		console.log('getting route by id')
		// console.log(id)
		// console.log()
		var result = await routeService.getRouteById(id)
		// res.send('got route by id')
		res.send(result)
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function getRouteByOriginAndDestination(req, res, next) {
	try{
		var {originId, destId} = req.params
		originId = Number(originId)
		destId = Number(destId)

		// validate request
		if (isNaN(originId)) throw 'originId must be a number'
		if (isNaN(destId)) throw 'destId must be a number'
		if (originId < 1) throw 'originId must be an integer greater than 0'
		if (destId < 1) throw 'destId must be an integer greater than 0'
		if (destId === originId) throw 'destId and originId cannot be equal'

		// process the request
		console.log('getting route by origin and destination IDs')
		// console.log(originId + ' ' + destId)
		// console.log()
		var result = await routeService.getRouteByOriginAndDestination(originId, destId)
		// res.send('got route by origin and destination IDs')
		res.send(result)
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function createRoute(req, res, next) {
	try{
		var body = req.body
		var validationResult = validate(body, createRouteRequestSchema)

		// validate request
		if (!validationResult.valid) throw parseValidationErrors(validationResult.errors)
		if (Object.keys(body).length > createRouteRequestSchema.required.length) {
			throw 'request body must only have attributes: ' + createRouteRequestSchema.required.join(', ')
		}
		// process the request
		console.log('creating route')
		// console.log(body)
		// console.log()
		await routeService.createRoute(body)
		// res.send(response)
		res.send('created route')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deleteRouteById(req, res, next) {
	try{
		var id = Number(req.params.id)

		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!Number.isInteger(id) || id < 1) {
			throw 'id must be an integer greater than 0'
		}

		// process the request
		console.log('deleting route by id')
		await routeService.deleteRouteById(id)
		res.send('deleted route by id')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}