import axios from 'axios'

const api = axios.create({
	baseURL : import.meta.env.VITE_API_URL
})

export const getLocationByAddress = (address, signal) => {
	return api.get(`/location/address/${address}`, {signal : signal})
	.catch(error => {
		console.log(error)
		throw error
	})
}
export const getRouteByEndpointIds = (originId, destId, signal) => {
	return api.get(`/route/${originId}/${destId}`, {signal : signal})
	.catch(error => {
		console.log(error)
		throw error
	})
}
export const getTripsByRouteIdAndStartTime = (routeId, startTime, numTrips, signal) => {
	return api.get(`trip/${routeId}/${startTime}/${numTrips}`, {signal : signal})
	.catch(error => {
		console.log(error)
		throw error
	})
}

const commuteApi = {
	getLocationByAddress,
	getRouteByEndpointIds,
	getTripsByRouteIdAndStartTime,
}

export default commuteApi