import express from 'express'
import methods from './dispatcher.js'

const router = express.Router()

router.get('/', (req, res) => {
	res.send('api root')
})

router.post('/', async (req, res, next) => {
	// console.log("=================== /api/ req ===================")
	// console.log(req.body)
	// console.log("")
	try {
		const { method, data } = req.body || {}

		if (typeof method !== 'string' || !(method in methods)) {
			throw badRequest([`method must be one of: ${Object.keys(methods).join(', ')}`])
		}

		const { validate, handler } = methods[method]
		const validationErrors = validate(data || {})
		if (validationErrors.length > 0) {
			throw badRequest(validationErrors)
		}

		const result = await handler(data || {})
		res.send(result)
	}
	catch (err) {
		next(toErrorResponse(err))
	}
})

function badRequest(messages) {
	return { status: 400, error: 'Bad Request', messages }
}

// Every service/repository error that isn't already one of our own
// { status, error, messages } shapes (badRequest above, or a
// validation failure) comes from further down -- currently only
// googleMapsService's `{ name: 'Google Resource Not Found', message }`
// objects. This is the one place that maps those into an HTTP status,
// replacing the three slightly-different copies of this logic that
// used to live in each controller.
function toErrorResponse(err) {
	if (err.status) return err

	const status = err.name === 'Google Resource Not Found' ? 422 : 500
	return {
		status,
		error: err.name || 'Internal Server Error',
		messages: [err.message || 'An unexpected error occurred.'],
	}
}

export default router
