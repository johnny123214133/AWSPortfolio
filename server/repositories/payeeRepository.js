import { getSMSPool } from '../db/index.js'

export async function getPayeeById(id) {
	const [rows] = await getSMSPool().execute(`
		select * from payee where id = ?;
		`, [id])
	return rows.length ? rows[0] : {}
}

export async function getPayeeByPhoneNumber(phoneNumber) {
	const [rows] = await getSMSPool().execute(`
		select * from payee where phone_number = ?;
		`, [phoneNumber])
	return rows.length ? rows[0] : {}
}

export async function createPayee(params) {
	await getSMSPool().execute(`
		insert into payee (first_name, last_name, phone_number) values (?, ?, ?);
		`, [params.firstName, params.lastName, params.phoneNumber])
	// return rows[0]
}

export async function deletePayeeById(id) {
	await getSMSPool().execute(`
		delete from payee where id = ?;
		`, [id])
	// return
}

export async function deletePayeeByPhoneNumber(phoneNumber) {
	await getSMSPool().execute(`
		delete from payee where phone_number = ?;
		`, [phoneNumber])
	// return
}