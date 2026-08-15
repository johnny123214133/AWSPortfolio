const GEOCODE_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json'
const DIRECTIONS_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/directions/json'

function notFoundError(message) {
	return { name: 'Google Resource Not Found', message }
}

function internalError(message) {
	return { name: 'Internal Server Error', message }
}

async function fetchGoogleMaps(endpoint, params) {
	const url = `${endpoint}?${new URLSearchParams(params)}`
	const response = await fetch(url).then((res) => res.json())
	if (response.status === 'NOT_FOUND' || response.status === 'ZERO_RESULTS') {
		throw notFoundError('Google Maps could not resolve the given address, coordinates, or route.')
	}
	return response
}

export async function getLocationByAddress(address) {
	return fetchGoogleMaps(GEOCODE_API_ENDPOINT, {
		address,
		key: process.env.GOOGLE_MAPS_API_KEY,
	})
}

export async function getLocationByLatLng(lat, lng) {
	// the topmost result is the most specific address for the given
	// coordinates, per Google's geocoding API documentation
	return fetchGoogleMaps(GEOCODE_API_ENDPOINT, {
		latlng: `${lat},${lng}`,
		location_type: 'ROOFTOP',
		result_type: 'street_address',
		key: process.env.GOOGLE_MAPS_API_KEY,
	})
}

// departureTime is seconds since the Unix epoch
export async function getTrip(origin, destination, departureTime, trafficModel = 'best_guess') {
	return fetchGoogleMaps(DIRECTIONS_API_ENDPOINT, {
		origin,
		destination,
		departure_time: departureTime,
		traffic_model: trafficModel,
		mode: 'driving',
		key: process.env.GOOGLE_MAPS_API_KEY,
	})
}

export async function getTripDuration(origin, destination, departureTime, trafficModel = 'best_guess') {
	const response = await getTrip(origin, destination, departureTime, trafficModel)
	const durationInTrafficSeconds = response.routes?.[0]?.legs?.[0]?.duration_in_traffic?.value
	if (!durationInTrafficSeconds) {
		throw internalError('Unexpected response shape from the Google Maps directions API.')
	}
	return Math.ceil(durationInTrafficSeconds / 60)
}

export async function getCoordsFromAddress(address) {
	const response = await getLocationByAddress(address)
	const location = response.results?.[0]?.geometry?.location
	if (!location) {
		throw internalError('Unexpected response shape from the Google Maps geocoding API.')
	}
	return location
}

export async function getAddressFromCoords(lat, lng) {
	const response = await getLocationByLatLng(lat, lng)
	const formattedAddress = response.results?.[0]?.formatted_address
	if (!formattedAddress) {
		throw internalError('Unexpected response shape from the Google Maps geocoding API.')
	}
	return formattedAddress
}
