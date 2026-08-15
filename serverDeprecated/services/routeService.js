import { routeRepository } from '../repositories/index.js'

export async function getRouteById(id) {
	// Cases:
	// route is in the database: return route
	// route is not in the database: return 40x error
	try {
		// console.log('I\'m in the service layer!')
		return await routeRepository.getRouteById(id)
	}
	catch (err) {
		throw err
	}
}

export async function getRouteByOriginAndDestination(originId, destId) {
	// Cases:
	// route is in the database: return route
	// route is not in the database: create and return a new route, 201 created
	try {
		return await routeRepository.getRouteByOriginAndDestination(originId, destId)
		.then((route) => {
			if (Object.keys(route).length == 0) {
				var body = {
					'originId' : originId,
					'destId' : destId
				}
				// return {}
				return routeRepository.createRoute(body).then(() => {
					// return {}
					return routeRepository.getRouteByOriginAndDestination(originId, destId)
				})
			}
			else return route
		})
	}
	catch (err) {
		throw err
	}
}

export async function createRoute(body) {
	// Cases: 
	// route is in the database: return 200 ok
	// route is not in the database: create and return 201 created
	try {
		if (Object.keys(await getRouteByOriginAndDestination(body.originId, body.destId)).length == 0) {
			await routeRepository.createRoute(body)
		}
	}
	catch (err) {
		throw err
	}
}

export async function deleteRouteById(id) {
	// Cases:
	// route is in the database: return route
	// route is not in the database: return 40x error
	try {
		await routeRepository.deleteRouteById(id)
	}
	catch (err) {
		throw err
	}
}
