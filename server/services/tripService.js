import { locationService, routeService, googleMapsService } from './index.js'
import { tripRepository } from '../repositories/index.js'
import { toMilliseconds, toMYSQLDateTime } from '../utils/dateUtils.js'
import { SECOND_MILLISECONDS, FIFTEEN_MINUTES_MILLISECONDS } from '../utils/constants.js'

// Only getSomeTrips is reachable from the dispatcher (see
// ../api/dispatcher.js). getTripByRouteAndStartTime and createTrip
// stay here as internal building blocks getSomeTrips relies on.
// getTripById and deleteTripById aren't currently called by anything
// -- kept for completeness, not deleted outright.

export async function getTripById(id) {
	return tripRepository.getTripById(id)
}

export async function getTripByRouteAndStartTime(routeId, startTime) {
	const roundedStartTime = roundToNextQuarterHour(toMilliseconds(startTime))
	const startTimeForDb = toMYSQLDateTime(roundedStartTime)

	const existing = await tripRepository.getTripByRouteAndStartTime(routeId, startTimeForDb)
	if (Object.keys(existing).length > 0) return existing

	const newTrip = await generateTrip(routeId, roundedStartTime)
	await createTrip(newTrip)
	return tripRepository.getTripByRouteAndStartTime(routeId, startTimeForDb)
}

export async function getSomeTrips(routeId, startTime, numTrips = 10) {
	const roundedStartTime = roundToNextQuarterHour(toMilliseconds(startTime))

	const tripPromises = []
	for (let i = 0; i < numTrips; i++) {
		tripPromises.push(getTripByRouteAndStartTime(routeId, roundedStartTime + i * FIFTEEN_MINUTES_MILLISECONDS))
	}

	const trips = await Promise.all(tripPromises)
	return trips.sort((a, b) => a.start_time - b.start_time)
}

export async function createTrip(body) {
	const startTimeForDb = toMYSQLDateTime(roundToNextQuarterHour(toMilliseconds(body.startTime)))
	const existing = await tripRepository.getTripByRouteAndStartTime(body.routeId, startTimeForDb)
	if (Object.keys(existing).length === 0) {
		await tripRepository.createTrip({ ...body, startTime: startTimeForDb })
	}
}

export async function deleteTripById(id) {
	await tripRepository.deleteTripById(id)
}

function roundToNextQuarterHour(milliseconds) {
	return Math.ceil(milliseconds / FIFTEEN_MINUTES_MILLISECONDS) * FIFTEEN_MINUTES_MILLISECONDS
}

function millisecondsToSeconds(milliseconds) {
	return Math.ceil(milliseconds / SECOND_MILLISECONDS)
}

// Builds a new trip's best/avg/worst duration by calling out to Google
// Maps -- only runs when getTripByRouteAndStartTime doesn't already
// have this route+time cached in the database.
async function generateTrip(routeId, startTime) {
	const departureTime = millisecondsToSeconds(startTime)
	const route = await routeService.getRouteById(routeId)

	const [origin, destination] = await Promise.all([
		locationService.getLocationById(route.origin_id).then((location) => location.address),
		locationService.getLocationById(route.dest_id).then((location) => location.address),
	])

	const [bestDuration, avgDuration, worstDuration] = await Promise.all([
		googleMapsService.getTripDuration(origin, destination, departureTime, 'optimistic'),
		googleMapsService.getTripDuration(origin, destination, departureTime),
		googleMapsService.getTripDuration(origin, destination, departureTime, 'pessimistic'),
	])

	return { routeId, startTime, bestDuration, avgDuration, worstDuration }
}
