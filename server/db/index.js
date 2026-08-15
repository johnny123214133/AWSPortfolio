import mysql from 'mysql2/promise'

let commutePool

export function getCommutePool() {
	if (commutePool) return commutePool

	commutePool = mysql.createPool({
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_COMMUTE_DB,
		// `trip.start_time` is a naive DATETIME (no timezone info) and
		// we always write/read it as UTC ourselves (see
		// utils/dateUtils.js) -- telling the driver to treat it as UTC
		// consistently on both ends means it round-trips correctly,
		// instead of mysql2 silently re-interpreting it in whatever
		// timezone this server process happens to be running in.
		timezone: 'Z',
	})
	return commutePool
}
