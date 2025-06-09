import express from 'express'

var router = express.Router()

router.get('/', async(req, res) => {
	console.log('default response')
	res.send('api root')
})

export default router