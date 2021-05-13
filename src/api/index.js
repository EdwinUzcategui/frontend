import axios from 'axios'

export default axios.create({
	// baseURL: 'http://localhost/jirehpro/backend/public/api/',
	baseURL: 'https://echo.livingcodestudio.com/api/',
	headers: {
		'Content-Type': 'application/json',
	},
})
