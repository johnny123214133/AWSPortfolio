import commuteApi from '../api/index.js'

// React 18 StrictMode (dev only) invokes effects twice on mount, so
// this guards against running with the provider's still-empty initial
// params/routeDetails object.
function hasParams(params) {
	return Boolean(params) && Object.keys(params).length > 0
}

export async function getRouteDetails(params, signal) {
	if (!hasParams(params)) return {}

	const [origin, destination] = await Promise.all([
		commuteApi.getLocationByAddress(params.originAddress, signal),
		commuteApi.getLocationByAddress(params.destinationAddress, signal),
	])

	const [morningRoute, eveningRoute] = await Promise.all([
		commuteApi.getRouteByEndpointIds(origin.data.id, destination.data.id, signal),
		commuteApi.getRouteByEndpointIds(destination.data.id, origin.data.id, signal),
	])

	return {
		origin: origin.data,
		destination: destination.data,
		morningRoute: morningRoute.data,
		eveningRoute: eveningRoute.data,
		morningTimeDelta: params.morningTimeDelta,
		eveningTimeDelta: params.eveningTimeDelta,
		startDate: params.startDate,
	}
}

export async function getTrips(routeDetails, signal) {
	if (!hasParams(routeDetails)) return {}

	const trips = { morning: {}, evening: {} }
	let startTime = routeDetails.startDate

	// Sequential rather than firing all 14 requests (7 days x morning/
	// evening) at once -- preserving the original's pacing rather than
	// changing request/load behavior as part of this cleanup.
	for (let i = 0; i < 7; i++) {
		const morningStartTime =
			startTime + (routeDetails.morningTimeDelta[0] * 60 + routeDetails.morningTimeDelta[1]) * 60 * 1000
		const eveningStartTime =
			startTime + (routeDetails.eveningTimeDelta[0] * 60 + routeDetails.eveningTimeDelta[1]) * 60 * 1000

		trips.morning[startTime] = await commuteApi
			.getTripsByRouteIdAndStartTime(routeDetails.morningRoute.id, morningStartTime, 10, signal)
			.then((result) => result.data)
		trips.evening[startTime] = await commuteApi
			.getTripsByRouteIdAndStartTime(routeDetails.eveningRoute.id, eveningStartTime, 10, signal)
			.then((result) => result.data)

		startTime += 24 * 60 * 60 * 1000
	}

	return trips
}
