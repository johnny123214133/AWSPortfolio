import { locationService, routeService, googleMapsService } from './index.js'
import { tripRepository } from '../repositories/index.js'
import { toMilliseconds, toISOString, toMYSQLDateTime, fromMYSQLUTC } from '../utils/dateUtils.js'
import { SECOND_MILLISECONDS, FIFTEEN_MINUTES_MILLISECONDS } from '../utils/constants.js'

export async function getTripById(id) {
	// Cases:
	// trip is in the database: return trip
	// trip is not in the database: return 40x error
	try {
		return await tripRepository.getTripById(id).then((trip) => {
			trip.start_time = fromMYSQLUTC(trip.start_time)
			return trip
		})
	}
	catch (err) {
		throw err
	}
}

export async function getTripByRouteAndStartTime(routeId, startTime) {
	// Cases:
	// trip is in the database: return trip
	// trip is not in the database:
	// - create a new trip via googleMaps, save it, and return the new trip, 201 created
	// - if googleMaps cannot create a trip, throw an error
	try {
		startTime = toMilliseconds(startTime)
		startTime = roundToNextQuarterHour(startTime)
		var startTimeForDb = toMYSQLDateTime(startTime)
		return await tripRepository.getTripByRouteAndStartTime(routeId, startTimeForDb)
		.then((trip) => {
			if (Object.keys(trip).length == 0) {
				return generateTrip(routeId, toMilliseconds(startTime))
				.then((newTrip) => {
					return createTrip(newTrip).then(() => {
						return tripRepository.getTripByRouteAndStartTime(routeId, startTimeForDb)
						.then(trip => {
							// convert utc to local tz
							trip.start_time = fromMYSQLUTC(trip.start_time)
							return trip
						})
					})
				})
			}
			else {
				trip.start_time = fromMYSQLUTC(trip.start_time)
				return trip
			}
		})
	}
	catch (err) {
		throw err
	}
}

export async function getSomeTrips(routeId, startTime, numTrips = 10) {
	// Cases: 
	// get or create numTrips consecutive trips starting at startTime
	try {
		startTime = toMilliseconds(startTime)
		startTime = roundToNextQuarterHour(startTime)
		// console.log(startTime)
		var startTimeForDb = toMYSQLDateTime(startTime)
		var trips = []
		for (let i = 0; i < numTrips; i++) {
			var delta = i * FIFTEEN_MINUTES_MILLISECONDS
			trips.push(getTripByRouteAndStartTime(routeId, startTime + delta))
		}
		return await Promise.all(trips).then(trips => {
			return trips.sort((a, b) => a.start_time - b.start_time)
		})
	}
	catch (err) {
		throw err
	}
}

export async function createTrip(body) {
	// Cases: 
	// trip is in the database: return 200 ok
	// trip is not in the database:
	// - create a new trip, save it, and return 201 created
	// - if googleMaps cannot create a trip, throw an error
	try {
		body.startTime = toMilliseconds(body.startTime)
		body.startTime = roundToNextQuarterHour(body.startTime)
		body.startTime = toMYSQLDateTime(body.startTime)
		if (Object.keys(await tripRepository.getTripByRouteAndStartTime(body.routeId, body.startTime)).length == 0) {
			await tripRepository.createTrip(body)
		}
	}
	catch (err) {
		throw err
	}
}

export function deleteTripById(id) {
	// Cases:
	// trip is in the database: return trip
	// trip is not in the database: return 40x error
	try {
		tripRepository.deleteTripById(id)
	}
	catch (err) {
		throw err
	}
}


function millisecondsToSeconds(milliseconds) {
	return Math.ceil(milliseconds / SECOND_MILLISECONDS)
}
function secondsToMilliseconds(seconds) {
	return seconds * SECOND_MILLISECONDS
}
function roundToNextQuarterHour(milliseconds) {
	return Math.ceil(milliseconds / FIFTEEN_MINUTES_MILLISECONDS) * FIFTEEN_MINUTES_MILLISECONDS
}

// generate a trip using services
async function generateTrip(routeId, startTime) {
	try {
		var departureTime = millisecondsToSeconds(startTime)
		return await routeService.getRouteById(routeId)
		.then((route) => {
			var origin = locationService.getLocationById(route.origin_id)
			.then(location => {
				return location.address
			})
			var destination = locationService.getLocationById(route.dest_id)
			.then(location => {
				return location.address
			})
			return Promise.all([origin, destination])
			.then(([origin, destination]) => {
				var bestTrip = googleMapsService.getTripDuration(origin, destination, departureTime, 'optimistic')
				var avgTrip = googleMapsService.getTripDuration(origin, destination, departureTime)
				var worstTrip = googleMapsService.getTripDuration(origin, destination, departureTime, 'pessimistic')
				return Promise.all([bestTrip, avgTrip, worstTrip])
				.then(([bestTrip, avgTrip, worstTrip]) => {
					return {
						'routeId' : routeId,
						'startTime' : startTime,
						'bestDuration' : bestTrip,
						'avgDuration' : avgTrip,
						'worstDuration' : worstTrip
					}
				})
			})
		})
	}
	catch (err) {
		throw err
	}
}




