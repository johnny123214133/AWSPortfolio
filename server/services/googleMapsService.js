const geocodeAPIEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json'
const routesAPIEndpoint = 'https://maps.googleapis.com/maps/api/directions/json'

export async function getLocationByAddress(address) {
	// geocode api 
	try {
		var params = new URLSearchParams({
			'address' : address,
			'key' : process.env.GOOGLE_MAPS_API_KEY
		})
		var response = await fetch(geocodeAPIEndpoint + '?' + params)
		.then(function(response) {
			console.log(response)
			return response.json();
		}).then(response => {
			if (response.status === 'NOT_FOUND' || response.status ==='ZERO_RESULTS') {
				throw {name: 'Google Resource Not Found', message: 'Address not found.'}
			}
			console.log('============================')
			console.log(response)
			return response
		})
		return response
		// var coords = response.results[0].geometry.location
		// return coords
	}
	catch(err) {
		console.log('error in google service:')
		console.log(err)
		throw err
	}
}

export async function getLocationByLatLng(lat, lng) {
	try {
		var params = new URLSearchParams({
			'latlng' : lat + ',' + lng,
			'location_type' : 'ROOFTOP',
			'result_type' : 'street_address',
			'key' : process.env.GOOGLE_MAPS_API_KEY
		})
		// the topmost result is the most specific address for the given coordinates,
		// according to Google's API documentation
		return await fetch(geocodeAPIEndpoint + '?' + params)
		.then(function(response) {
			return response.json();
		})
		.then(response => {
			if (response.status === 'NOT_FOUND' || response.status ==='ZERO_RESULTS') {
				console.log('throwing error in google service')
				throw {name: 'Google Resource Not Found', message: 'Address for given coordinates does not exist.'}
			}
			return response
		})
	}
	catch(err) {
		console.log('error in google service:')
		console.log(err)
		throw err
	}
}

// departure time is represented as num seconds since 1/1/1970
export async function getTrip(origin, destination, departureTime, trafficModel='best_guess') {
	// console.log(trafficModel)
	try {
		var params = new URLSearchParams({
			'destination' : destination,
			'origin' : origin,
			'departure_time' : departureTime,
			'traffic_model' : trafficModel,
			'mode' : 'driving',
			'key' : process.env.GOOGLE_MAPS_API_KEY
		})
		params = new URLSearchParams(params)
		return await fetch(routesAPIEndpoint + '?' + params)
		.then(function(response) {
			return response.json();
		})
		.then(response => {
			if (response.status === 'NOT_FOUND') {
				throw {name: 'Google Resource Not Found', message: 'One or more addresses not found.'}
			}
			return response
		})
	}
	catch(err) {
		console.log('error in google service:')
		console.log(err)
		throw err
	}
}

export async function getTripDuration(origin, destination, departureTime, trafficModel='best_guess') {
	try {
		var response = await getTrip(origin, destination, departureTime, trafficModel).then(trip => {
			// console.log(trip)
			return trip
		})
		// console.log(response.routes[0].legs)
		if (response.status === 'NOT_FOUND' || response.status ==='ZERO_RESULTS') {
			throw {name: 'Google Resource Not Found', message: 'One or more addresses not found.'}
		}
		if (!response.routes[0].legs[0].duration_in_traffic.value) {
			throw {name: 'Internal Server Error', message: 'Unknown error occurred while processing response from Google Maps'}
		}
		return durationInMinutes(response.routes[0].legs[0].duration_in_traffic.value)
	}
	catch (err) {
		throw err
	}
}

function durationInMinutes(numSeconds) {
	// console.log(numSeconds)
	return Math.ceil(numSeconds / 60)
}

export async function getCoordsFromAddress(address) {
	try {
		var response = await getLocationByAddress(address)
		// console.log(response)
		if (response.status === 'NOT_FOUND' || response.status ==='ZERO_RESULTS') {
			throw {name: 'Google Resource Not Found', message: 'Address not found.'}
		}
		if (!response.results[0].geometry.location) {
			throw {name: 'Internal Server Error', message: 'Unknown error occurred while processing response from Google Maps'}
		}
		return response.results[0].geometry.location
	}
	catch (err) {
		throw err
	}
}

export async function getAddressFromCoords(lat, lng) {
	try {
		var response = await getLocationByLatLng(lat, lng)
		if (response.status === 'NOT_FOUND' || response.status ==='ZERO_RESULTS') {
			throw {name: 'Google Resource Not Found', message: 'Address for given coordinates does not exist.'}
		}
		// console.log(response)
		if (!response.results[0].formatted_address) {
			throw {name: 'Internal Server Error', message: 'Unknown error occurred while processing response from Google Maps'}
		}
		return response.results[0].formatted_address
	}
	catch (err) {
		throw err
	}
}




