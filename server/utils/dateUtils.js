import { MINUTE_MILLISECONDS } from './constants.js'

export function toMilliseconds(startTime) {
	var date = new Date(startTime)
	return date.getTime()
}

export function toISOString(startTime) {
	var date = new Date(startTime)
	return date.toISOString()
}

export function toMYSQLDateTime(startTime) {
	var date = new Date(startTime)
	date = date.toISOString().slice(0, 19).replace('T', ' ')
	return date
}

export function fromMYSQLUTC(startTime) {
	var date = new Date(startTime) - new Date().getTimezoneOffset() * MINUTE_MILLISECONDS
	return date
}
