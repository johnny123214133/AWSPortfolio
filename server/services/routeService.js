import { routeRepository } from '../repositories/index.js'

// Only getRouteByOriginAndDestination is reachable from the dispatcher
// -- see the note at the top of locationService.js, same reasoning
// applies here for getRouteById (internal building block, used by
// tripService) versus createRoute/deleteRouteById (currently unused,
// kept for completeness).

export async function getRouteById(id) {
	return routeRepository.getRouteById(id)
}

export async function getRouteByOriginAndDestination(originId, destId) {
	const existing = await routeRepository.getRouteByOriginAndDestination(originId, destId)
	if (Object.keys(existing).length > 0) return existing

	await routeRepository.createRoute({ originId, destId })
	return routeRepository.getRouteByOriginAndDestination(originId, destId)
}

export async function createRoute(body) {
	// note: getRouteByOriginAndDestination above already creates the
	// route if it doesn't exist, so this dedupe check will basically
	// always find something, and routeRepository.createRoute below
	// rarely (if ever) actually runs. Pre-existing behavior from before
	// this rewrite -- left as-is since this function isn't currently
	// reachable from the dispatcher, but worth knowing if you ever wire
	// it up directly.
	const existing = await getRouteByOriginAndDestination(body.originId, body.destId)
	if (Object.keys(existing).length === 0) {
		await routeRepository.createRoute(body)
	}
}

export async function deleteRouteById(id) {
	await routeRepository.deleteRouteById(id)
}
