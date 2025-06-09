import{ validate }from 'jsonschema'

import { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } from '../utils/constants.js'
import { createLocationRequestSchema } from './schema/index.js'
import parseValidationErrors from '../utils/schemaValidation.js'
import { locationService } from '../services/index.js'

export async function getLocationRoot(req, res) {
	console.log('location root')
	res.send('location root')
}

export async function getLocationById(req, res, next) {
	try{
		if (req.params.id === 'address') {
			next()
		}
		// console.log('get location by id')
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
		console.log('getting location by id')
		// console.log(id)
		// console.log()
		var result = await locationService.getLocationById(id)
		// res.send('got location by id')
		res.send(result)
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function getLocationByAddress(req, res, next) {
	try{
		console.log('get location by address')
		var address = req.params.address
		console.log(address)

		// validate request
		if (!typeof address === 'string') {
			throw 'address must be a string'
		}
		// process the request
		console.log('getting location by address')
		// console.log(address)
		// console.log()
		var result = await locationService.getLocationByAddress(address)
		// res.send('got location by address')
		console.log(result)
		res.send(result)
	}
	catch (err) {
		var status = !err.name ? 400 : err.name === "Google Resource Not Found" ? 422 : 500
		var name = err.name || 'Bad Request'
		next({status: status, error: name, messages: err.message || err})
	}
}

export async function getLocationByLatLng(req, res, next) {
	try{
		var {lat, lng} = req.params
		lat = Number(lat)
		lng = Number(lng)

		// validate request
		if (isNaN(lat)) throw 'lat must be a number'
		if (isNaN(lng)) throw 'lng must be a number'
		if (lat <= LAT_MIN || lat >= LAT_MAX) {
			throw 'lat must be bewteen ' + LAT_MIN + ' and ' + LAT_MAX
		}
		if (lng <= LNG_MIN || lng >= LNG_MAX) {
			throw 'lng must be bewteen ' + LNG_MIN + ' and ' + LNG_MAX
		}

		// process the request
		console.log('getting location by lat lng')
		// console.log(lat + ' ' + lng)
		// console.log()
		var result = await locationService.getLocationByLatLng(lat, lng)
		// res.send('got location by lat lng')
		res.send(result)
	}
	catch (err) {
		var status = !err.name ? 400 : err.name === "Google Resource Not Found" ? 422 : 500
		var name = err.name || 'Bad Request'
		next({status: status, error: name, messages: err.message || err})
	}
}

export async function createLocation(req, res, next) {
	try{
		var body = req.body
		var validationResult = validate(body, createLocationRequestSchema)

		// validate request
		if (!validationResult.valid) throw parseValidationErrors(validationResult.errors)
		if (Object.keys(body).length > createLocationRequestSchema.required.length) {
			throw ['request body must only have attributes: ' + createLocationRequestSchema.required.join(', ')]
		}

		// process the request
		console.log('creating location')
		// console.log(body)
		// console.log()
		await locationService.createLocation(body)
		// res.send(response)
		res.send('created location')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}

export async function deleteLocationById(req, res, next) {
	try{
		var id = Number(req.params.id)
		
		// validate request
		// all erroneous inputs for id are implicitly caught by the isInteger check
		// or by requiring the result of the Number() function to be greater than 0
		if (!Number.isInteger(id) || id < 1) {
			throw 'id must be an integer greater than 0'
		}
		
		// process the request
		console.log('deleting location by id')
		await locationService.deleteLocationById(id)
		res.send('deleted location by id')
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}
