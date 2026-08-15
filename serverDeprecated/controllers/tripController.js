import{ validate }from 'jsonschema'

import { createTripRequestSchema } from './schema/index.js'
import parseValidationErrors from '../utils/schemaValidation.js'
import { tripService } from '../services/index.js'

export async function getTripRoot(req, res, next) {
	console.log('trip root')
	res.send('trip root')
}

export async function getTripById(req, res, next) {
	try{
		var id = Number(req.params.id)

		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!Number.isInteger(id) || id < 1) {
			throw 'id must be an integer greater than 0'
		}

		// process the request
		console.log('getting trip by id')
		var result = await tripService.getTripById(id)
		// res.send('got trip by id')
		res.send(result)
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function getTripByRouteAndStartTime(req, res, next) {
	try{
		var {routeId, startTime} = req.params
		var now = new Date().getTime()
		routeId = Number(routeId)
		startTime = Number(startTime)

		// validate request
		if (!Number.isInteger(routeId) || routeId < 1) throw 'routeId must be an integer greater than 0'
		if (!Number.isInteger(startTime) || startTime < now) {
			throw 'startTime must be a future datetime in milliseconds, greater than now: ' + new Date().getTime()
		}

		// process the request
		console.log('getting trip by route ID and start time')
		var trip = await tripService.getTripByRouteAndStartTime(routeId, startTime)
		// res.send('got trip by route ID and start time')
		res.send(trip)
	}
	catch (err) {
		var status = !err.name ? 400 : err.name === "Google Resource Not Found" ? 422 : 500
		var name = err.name || 'Bad Request'
		next({status: status, error: name, messages: err.message || err})
	}
}

export async function getSomeTrips(req, res, next) {
	try {
		var {routeId, startTime, numTrips} = req.params
		var now = new Date().getTime()
		routeId = Number(routeId)
		startTime = Number(startTime)
		numTrips = Number(numTrips)

		if (!Number.isInteger(routeId) || routeId < 1) throw 'routeId must be an integer greater than 0'
		if (!Number.isInteger(startTime) || startTime < now) {
			throw 'startTime must be a future datetime in milliseconds, greater than now: ' + new Date().getTime()
		}
		if (!Number.isInteger(numTrips) || numTrips < 1 || numTrips > 10) throw 'numTrips must be an integer between 1 and 10, inclusive'
		
		console.log('getting some trips')
		var result = await tripService.getSomeTrips(routeId, startTime, numTrips)
		// res.send('got some trips')
		res.send(result)
	}
	catch (err) {
		var status = !err.name ? 400 : err.name === "Google Resource Not Found" ? 422 : 500
		var name = err.name || 'Bad Request'
		next({status: status, error: name, messages: err.message || err})
	}
}

export async function createTrip(req, res, next) {
	try{
		var body = req.body
		var now = new Date().getTime()
		var validationResult = validate(body, createTripRequestSchema)

		// validate request
		if (!validationResult.valid) throw parseValidationErrors(validationResult.errors)
		if (body.startTime < now) {
			throw 'startTime must be a future datetime in milliseconds, greater than ' + now
		}
		if (Object.keys(body).length > createTripRequestSchema.required.length) {
			throw 'request body must only have attributes: ' + createTripRequestSchema.required.join(', ')
		}
		
		// process the request
		console.log('creating trip')
		await tripService.createTrip(body)
		// res.send(response)
		res.send('created trip')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deleteTripById(req, res, next) {
	try{
		var id = Number(req.params.id)

		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!Number.isInteger(id) || id < 1) {
			throw 'id must be an integer greater than 0'
		}

		// process the request
		console.log('deleting trip by id')
		await tripService.deleteTripById(id)
		res.send('deleted trip by id')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}