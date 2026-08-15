import { getCommutePool } from '../db/index.js'

export async function getRouteById(id) {
	const [rows] = await getCommutePool().execute(
		'select * from route where id = ?;',
		[id]
	)
	return rows.length ? rows[0] : {}
}

export async function getRouteByOriginAndDestination(originId, destId) {
	const [rows] = await getCommutePool().execute(
		'select * from route where origin_id = ? and dest_id = ?;',
		[originId, destId]
	)
	return rows.length ? rows[0] : {}
}

export async function createRoute(params) {
	await getCommutePool().execute(
		'insert into route (origin_id, dest_id) values (?, ?);',
		[params.originId, params.destId]
	)
}

export async function deleteRouteById(id) {
	await getCommutePool().execute(
		'delete from route where id = ?;',
		[id]
	)
}
