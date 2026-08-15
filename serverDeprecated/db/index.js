import mysql from 'mysql2/promise'

var commutePool;
export function getCommutePool() {
	if (commutePool) {
		return commutePool
	}
	const config = {
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_COMMUTE_DB
	};
	commutePool = mysql.createPool(config)
	return commutePool
};

var SMSPool;
export function getSMSPool() {
	if (SMSPool) {
		return SMSPool
	}
	const config = {
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_SMS_DB
	};
	SMSPool = mysql.createPool(config)
	return SMSPool
};