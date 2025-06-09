import { getCommutePool } from '../db/index.js'

export async function getTripById(id) {
	const [rows] = await getCommutePool().execute(`
		select * from trip where id = ?;
		`, [id])
	return rows.length ? rows[0] : {}
}

export async function getTripByRouteAndStartTime(routeId, startTime) {
	const [rows] = await getCommutePool().execute(`
		select * from trip where route_id = ? and start_time = ?;
		`, [routeId, startTime])
	// console.log(rows.length)
	return rows.length ? rows[0] : {}
}

// export async function getSomeTrips(routeId, startTime, numTrips) {
// 	// console.log('params:')
// 	// console.log([routeId, startTime, numTrips])
// 	const [rows] = await getCommutePool().execute(`
// 		select * from trip where route_id = ? and start_time >= ? order by start_time asc limit ?;
// 		`, [routeId, startTime, numTrips])
// 	// console.log(rows)
// 	return rows.length ? rows : []
// }

export async function createTrip(params) {
	await getCommutePool().execute(`
		insert into trip 
			(route_id, start_time, worst_duration, avg_duration, best_duration) 
		values (?, ?, ?, ?, ?);
		`, [params.routeId, params.startTime, params.worstDuration, params.avgDuration, params.bestDuration])
	// return rows[0]
}

export async function deleteTripById(id) {
	await getCommutePool().execute(`
		delete from trip where id = ?;
		`, [id])
	// return rows[0]
}