import axios from 'axios'

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL
})

// Every backend operation now goes through one POST to the API root as
// { method, data } -- see server/api/dispatcher.js for the matching
// method registry. functions.js's calls into this file are unchanged
// (same function names, same params), so nothing above this file
// needed to change for the dispatcher swap.
function callApi(method, data, signal) {
	return api.post('/', { method, data }, { signal }).catch((error) => {
		console.error(error)
		throw error
	})
}

export const getLocationByAddress = (address, signal) =>
	callApi('getLocationByAddress', { address }, signal)

export const getRouteByEndpointIds = (originId, destId, signal) =>
	callApi('getRouteByEndpointIds', { originId, destId }, signal)

export const getTripsByRouteIdAndStartTime = (routeId, startTime, numTrips, signal) =>
	callApi('getTripsByRouteIdAndStartTime', { routeId, startTime, numTrips }, signal)

const commuteApi = {
	getLocationByAddress,
	getRouteByEndpointIds,
	getTripsByRouteIdAndStartTime,
}

export default commuteApi
