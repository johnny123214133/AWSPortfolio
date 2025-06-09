import axios from 'axios'

const api = axios.create({
	baseURL : import.meta.env.VITE_API_URL
})

export const createPayee = (firstName, lastName, phoneNumber, signal) => {
	try {
		return api.post(
			`/payee`, 
			{
				firstName : firstName,
				lastName : lastName,
				phoneNumber : phoneNumber
			},
			{signal : signal}
		)
	}
	catch(err) {
		throw err
	}
}

export const getPayeeByPhoneNumber = (phoneNumber, signal) => {
	try {
		return api.get(`/payee/phoneNumber/${phoneNumber}`)
	}
	catch(err) {
		throw err
	}
}

export const getPaymentMethodsByPhoneNumber = (phoneNumber, signal) => {
	try {
		return api.get(`/paymentMethod/phoneNumber/${phoneNumber}`)
	}
	catch(err) {
		throw err
	}
}

export const getPaymentMethodById = (id, signal) => {
	try {
		return api.get(`/paymentMethod/${id}`)
	}
	catch(err) {
		throw err
	}
}

export const getPaymentInteractionByPhoneNumber = (phoneNumber, signal) => {
	try {
		return api.get(`/paymentInteraction/phoneNumber/${phoneNumber}`)
	}
	catch(err) {
		throw err
	}
}

export const startInteraction = (phoneNumber, signal) => {
	try {
		return api.get(`/startInteraction/${phoneNumber}`)
	}
	catch(err) {
		throw err
	}
}

export const deletePayeeByPhoneNumber = (phoneNumber, signal) => {
	try {
		return api.delete(`/payee/phoneNumber/${phoneNumber}`)
	}
	catch(err) {
		throw err
	}
}

export const deletePaymentMethodsByPhoneNumber = (phoneNumber, signal) => {
	try {
		return api.delete(`/paymentMethod/phoneNumber/${phoneNumber}`)
	}
	catch(err) {
		throw err
	}
}

export const deletePaymentInteractionByPhoneNumber = (phoneNumber, signal) => {
	try {
		return api.delete(`/paymentInteraction/phoneNumber/${phoneNumber}`)
	}
	catch(err) {
		throw err
	}
}

const SMSApi = {
	createPayee,
	getPayeeByPhoneNumber,
	getPaymentMethodsByPhoneNumber,
	getPaymentMethodById,
	getPaymentInteractionByPhoneNumber,
	startInteraction,
	deletePayeeByPhoneNumber,
	deletePaymentMethodsByPhoneNumber,
	deletePaymentInteractionByPhoneNumber,
}

export default SMSApi