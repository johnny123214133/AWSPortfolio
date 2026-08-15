import { getCommutePool } from '../db/index.js'

export async function getLocationById(id) {
	const [rows] = await getCommutePool().execute(
		'select * from location where id = ?;',
		[id]
	)
	return rows.length ? rows[0] : {}
}

export async function getLocationByAddress(address) {
	const [rows] = await getCommutePool().execute(
		'select * from location where address = ?;',
		[address]
	)
	return rows.length ? rows[0] : {}
}

export async function getLocationByLatLng(lat, lng) {
	const [rows] = await getCommutePool().execute(
		'select * from location where lat = ? and lng = ?;',
		[lat, lng]
	)
	return rows.length ? rows[0] : {}
}

export async function createLocation(params) {
	await getCommutePool().execute(
		'insert into location (address, lat, lng) values (?, ?, ?);',
		[params.address, params.lat, params.lng]
	)
}

export async function deleteLocationById(id) {
	await getCommutePool().execute(
		'delete from location where id = ?;',
		[id]
	)
}
