import { getSMSPool } from '../db/index.js'

export async function getPaymentInteractionById(id) {
	const [rows] = await getSMSPool().execute(`
		select * from payment_interaction where id = ?;
		`, [id])
	return rows.length ? rows[0] : {}
}

export async function getPaymentInteractionByPhoneNumber(phoneNumber) {
	const [rows] = await getSMSPool().execute(`
		select * from payment_interaction where payee_phone_number = ?;
		`, [phoneNumber])
	return rows.length ? rows[0] : {}
}

export async function createPaymentInteraction(params) {
	await getSMSPool().execute(`
		insert into payment_interaction (payee_phone_number, current_payment_method_id, bill_id, state, invalid_response_counter) values (?, ?, ?, ?, ?);
		`, [params.payeePhoneNumber, params.currentPaymentMethodId, params.billId, params.state, params.invalidResponseCounter])
	// return rows[0]
}

export async function deletePaymentInteractionById(id) {
	await getSMSPool().execute(`
		delete from payment_interaction where id = ?;
		`, [id])
	// return
}

export async function deletePaymentInteractionByPhoneNumber(phoneNumber) {
	await getSMSPool().execute(`
		delete from payment_interaction where payee_phone_number = ?;
		`, [phoneNumber])
	// return
}