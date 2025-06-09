import{ validate }from 'jsonschema'

// import { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } from '../utils/constants.js'
import parseValidationErrors from '../utils/schemaValidation.js'
import { startInteractionService } from '../services/index.js'

export async function getStartInteractionRoot(req, res) {
	console.log('StartInteraction root')
	res.send('Start Interaction root')
}

export async function startInteraction(req, res, next) {
	try{
		console.log('get paymentInteraction by phone number')
		var phoneNumber = req.params.phoneNumber
		console.log(phoneNumber)

		// validate request
		if (!typeof phoneNumber === 'string') {
			throw 'phone number must be a string in E.164 format'
		}
		// process the request
		console.log('starting Interaction timer')
		// console.log(address)
		// console.log()
		var result = await startInteractionService.startInteraction(phoneNumber)
		// res.send('got paymentInteraction by address')
		res.send('started interaction timer')
		
	}
	catch (err) {
		next({status: 400, error: 'Bad Request', messages: err})
	}
}


