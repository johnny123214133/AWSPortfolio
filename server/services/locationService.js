import { googleMapsService } from './index.js'
import { locationRepository } from '../repositories/index.js'

// Only getLocationByAddress is reachable from the dispatcher (see
// ../api/dispatcher.js). getLocationById and createLocation stay here
// as internal building blocks other services use (tripService,
// getLocationByAddress's own fallback). getLocationByLatLng and
// deleteLocationById aren't currently called by anything, internally
// or externally -- kept as straightforward CRUD in case they're worth
// wiring up later, not deleted outright.

export async function getLocationById(id) {
	return locationRepository.getLocationById(id)
}

export async function getLocationByAddress(address) {
	// console.log("location service received address: " + address)
	const existing = await locationRepository.getLocationByAddress(address)
	// console.log("exists?")
	// console.log(existing)
	if (Object.keys(existing).length > 0) return existing

	const coords = await googleMapsService.getCoordsFromAddress(address)
	// console.log("coords: ")
	// console.log(coords)
	const existingByCoords = await locationRepository.getLocationByLatLng(coords.lat, coords.lng)
	// console.log("existing by coords: ")
	// console.log(existingByCoords)
	if (Object.keys(existingByCoords).length > 0) return existingByCoords

	await createLocation({ address, lat: coords.lat, lng: coords.lng })
	// console.log("location created, returning")
	return locationRepository.getLocationByAddress(address)
}

export async function getLocationByLatLng(lat, lng) {
	const existing = await locationRepository.getLocationByLatLng(lat, lng)
	if (Object.keys(existing).length > 0) return existing

	const address = await googleMapsService.getAddressFromCoords(lat, lng)
	await createLocation({ address, lat, lng })
	return locationRepository.getLocationByLatLng(lat, lng)
}

export async function createLocation(body) {
	const existing = await locationRepository.getLocationByAddress(body.address)
	if (Object.keys(existing).length === 0) {
		await locationRepository.createLocation(body)
	}
}

export async function deleteLocationById(id) {
	await locationRepository.deleteLocationById(id)
}
