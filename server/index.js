import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import apiRouter from './api/index.js'
import ErrorResponse from './utils/errorResponse.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', apiRouter)

// General error handler -- every route above passes errors to next()
// as a { status, error, messages } object (see api/index.js), so this
// just needs to shape and log the final response.
app.use((err, req, res, next) => {
	const response = new ErrorResponse(
		err.status || 500,
		err.error || 'Internal Server Error',
		err.messages || ['An unexpected error occurred.']
	)
	console.error(response)
	res.status(response.status).send(response)
})

const apiPort = process.env.API_PORT
app.listen(apiPort, () => {
	console.log(`Server is running on ${apiPort}.`)
})
