import SMSApi from '../../api/index.js'

export async function registerPayee(params, signal) {
	console.log(params)
	try {
		// create user
		// fetch all user data
		await SMSApi.createPayee(params.firstName, params.lastName, params.phoneNumber.substring(1), signal).then(result => {
			console.log(result)
		})
	}
	catch (err) {
		throw err
	}
}

export async function getPayeeData(phoneNumber, signal) {
	console.log(phoneNumber.substring(1))
	try {
		let data = {}
		return await Promise.all([
			SMSApi.getPayeeByPhoneNumber(phoneNumber.substring(1), signal),
			SMSApi.getPaymentMethodsByPhoneNumber(phoneNumber.substring(1), signal),
			SMSApi.getPaymentInteractionByPhoneNumber(phoneNumber.substring(1), signal)
		]).then(([payee, paymentMethods, paymentInteraction]) => {
			if (Object.keys(payee.data).length == 0 || paymentMethods.data.length == 0 || Object.keys(paymentInteraction.data).length == 0 ) throw 'Could not fetch Payee\'s data'
			data.payee = payee.data
			data.paymentMethods = paymentMethods.data
			data.paymentInteraction = paymentInteraction.data
			console.log('==== id ====')
			console.log(paymentInteraction.data)
			return Promise.all([
				SMSApi.getPaymentMethodById(paymentInteraction.data.currentPaymentMethodId, signal)
			])
		}).then(([paymentMethod]) => {
			console.log(paymentMethod.data)
			data.paymentInteraction.currentPaymentMethodAccountNumber = paymentMethod.data.accountNumber
			return data
		})
	}
	catch (err) {
		throw err
	}
}

export async function deletePayee(phoneNumber, signal) {
	try {
		// delete everything created for the current active user
		// interaction, then methods, then payee
		console.log(phoneNumber.substring(1))
		await SMSApi.deletePaymentInteractionByPhoneNumber(phoneNumber.substring(1), signal)
		await SMSApi.deletePaymentMethodsByPhoneNumber(phoneNumber.substring(1), signal)
		await SMSApi.deletePayeeByPhoneNumber(phoneNumber.substring(1), signal)
	}
	catch (err) {
		throw err
	}
}

export async function startPaymentInteraction(phoneNumber, signal) {
	try {
		// fire off a lambda to get the loop started
		// fire off a lambda with a timer that then deletes everything
		console.log(phoneNumber.substring(1))
		await SMSApi.startInteraction(phoneNumber.substring(1), signal)
		console.log('starting payment interaction')
	}
	catch (err) {
		throw err
	}
}

