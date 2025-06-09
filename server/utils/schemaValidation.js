export default function parseValidationErrors(errors) {
	var messages = []
	errors.forEach(error => {
		var attribute = error.property.split('.')[1]
		messages.push((attribute ? attribute + ' ' : '')  + error.message)
	})
	return messages
}