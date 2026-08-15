import { locationService, routeService, tripService } from '../services/index.js'

// Every operation the frontend can invoke lives here as one entry:
// `validate` returns an array of error strings (empty = valid) given
// the request's `data`, and `handler` actually performs the operation.
// Adding a new callable operation later means adding one entry here --
// nothing in api/index.js needs to change.

const methods = {
	getLocationByAddress: {
		validate(data) {
			const errors = []
			if (typeof data?.address !== 'string' || data.address.trim().length === 0) {
				errors.push('address must be a non-empty string')
			}
			return errors
		},
		handler(data) {
			// console.log("passing data to service")
			return locationService.getLocationByAddress(data.address)
		},
	},

	getRouteByEndpointIds: {
		validate(data) {
			const errors = []
			const originId = Number(data?.originId)
			const destId = Number(data?.destId)
			if (!Number.isInteger(originId) || originId < 1) {
				errors.push('originId must be an integer greater than 0')
			}
			if (!Number.isInteger(destId) || destId < 1) {
				errors.push('destId must be an integer greater than 0')
			}
			if (originId === destId) {
				errors.push('originId and destId cannot be equal')
			}
			return errors
		},
		handler(data) {
			return routeService.getRouteByOriginAndDestination(Number(data.originId), Number(data.destId))
		},
	},

	getTripsByRouteIdAndStartTime: {
		validate(data) {
			const errors = []
			const routeId = Number(data?.routeId)
			const startTime = Number(data?.startTime)
			const numTrips = data?.numTrips === undefined ? 10 : Number(data.numTrips)
			const now = Date.now()

			if (!Number.isInteger(routeId) || routeId < 1) {
				errors.push('routeId must be an integer greater than 0')
			}
			if (!Number.isInteger(startTime) || startTime < now) {
				errors.push(`startTime must be a future datetime in milliseconds, greater than ${now}`)
			}
			if (!Number.isInteger(numTrips) || numTrips < 1 || numTrips > 10) {
				errors.push('numTrips must be an integer between 1 and 10, inclusive')
			}
			return errors
		},
		handler(data) {
			const numTrips = data.numTrips === undefined ? 10 : Number(data.numTrips)
			return tripService.getSomeTrips(Number(data.routeId), Number(data.startTime), numTrips)
		},
	},
}

export default methods
