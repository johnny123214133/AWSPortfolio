import { googleMapsService } from './index.js'
import { locationRepository } from '../repositories/index.js'

export async function getLocationById(id) {
	// Cases:
	// location is in the database: return location
	// location is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await locationRepository.getLocationById(id)
	}
	catch (err) {
		throw err
	}
}

export async function getLocationByAddress(address) {
	// Cases:
	// location is in the database: return location
	// location is not in the database:
	// - create a new location via googleMaps, save it, and return the new location
	// - if googleMaps cannot create a location, throw an error
	try {
		// console.log('in service, getting location by address')
		return await locationRepository.getLocationByAddress(address)
		.then((location) => {
			// console.log('=A=')
			// console.log(location)
			if (Object.keys(location).length == 0) {
				return googleMapsService.getCoordsFromAddress(address)
				.then((coords) => {
					// console.log('=B=')
					// console.log(coords)
					return locationRepository.getLocationByLatLng(coords.lat, coords.lng)
					.then((result) => {
						// console.log('=C=')
						// console.log(result)
						if (Object.keys(result).length == 0) {
							var body = {
								'address' : address,
								'lat' : coords.lat,
								'lng' : coords.lng
							}
							// console.log('=D=')
							// console.log(body)
							return createLocation(body).then(() => {
								return locationRepository.getLocationByAddress(address)
							})
						}
						else return result
					})
				})
			}
			else return location
		})
	}
	catch (err) {
		throw err
	}
}

export async function getLocationByLatLng(lat, lng) {
	// Cases: 
	// location is in the database: return location
	// location is not in the database:
	// - create a new location via googleMaps, save it, and return the new location
	// - if googleMaps cannot create a location, throw an error
	try {
		console.log('in service, getting location by lat lng')
		return await locationRepository.getLocationByLatLng(lat, lng)
		.then((location) => {
			console.log('got location?')
			console.log(location)
			if (Object.keys(location).length == 0) {
				return googleMapsService.getAddressFromCoords(lat,lng)
				.then((address) => {
					console.log('building object to add to persistence layer:')
					var body = {
						'address' : address,
						'lat' : lat,
						'lng' : lng
					}
					console.log(body)
					return createLocation(body).then(() => {
						return locationRepository.getLocationByLatLng(lat, lng)
					})
				})
			}
			else {
				console.log('got location?')
				console.log(location)
				return location
			}
		})
	}
	catch (err) {
		throw err
	}
}

export async function createLocation(body) {
	// Cases: 
	// location is in the database: return 200 ok
	// location is not in the database: add it and return 201 created
	try {
		if (Object.keys(await locationRepository.getLocationByAddress(body.address)).length == 0) {
			await locationRepository.createLocation(body)
		}
	}
	catch (err) {
		throw err
	}
}

export async function deleteLocationById(id) {
	// Cases:
	// location is in the database: return location
	// location is not in the database: return 40x error
	try {
		await locationRepository.deleteLocationById(id)
	}
	catch (err) {
		throw err
	}
}
