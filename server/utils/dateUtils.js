// `trip.start_time` round-trips as a real UTC instant now that the
// pool is configured with timezone: 'Z' (see ../db/index.js) -- mysql2
// hands back a proper JS Date on read, no manual offset correction
// needed on this end anymore.

export function toMilliseconds(time) {
	return new Date(time).getTime()
}

export function toMYSQLDateTime(time) {
	return new Date(time).toISOString().slice(0, 19).replace('T', ' ')
}
