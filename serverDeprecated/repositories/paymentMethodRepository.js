import { getSMSPool } from '../db/index.js'

export async function getPaymentMethodById(id) {
	const [rows] = await getSMSPool().execute(`
		select * from payment_method where id = ?;
		`, [id])
	return rows.length ? rows[0] : {}
}

export async function getPaymentMethodsByPhoneNumber(phoneNumber) {
	const [rows] = await getSMSPool().execute(`
		select * from payment_method where payee_phone_number = ?;
		`, [phoneNumber])
	return rows.length ? rows : {}
}

export async function getPaymentMethodByAccountNumberAndPhoneNumber(accountNumber, phoneNumber) {
	const [rows] = await getSMSPool().execute(`
		select * from payment_method where account_number = ? and payee_phone_number = ?;
		`, [accountNumber, phoneNumber])
	return rows.length ? rows[0] : {}
}

export async function createPaymentMethod(params) {
	await getSMSPool().execute(`
		insert into payment_method (payee_phone_number, account_number, pin) values (?, ?, ?);
		`, [params.payeePhoneNumber, params.accountNumber, params.pin])
	// return rows[0]
}

export async function deletePaymentMethodById(id) {
	await getSMSPool().execute(`
		delete from payment_method where id = ?;
		`, [id])
	// return
}

export async function deletePaymentMethodsByPhoneNumber(phoneNumber) {
	await getSMSPool().execute(`
		delete from payment_method where payee_phone_number = ?;
		`, [phoneNumber])
	// return
}