export default function ErrorResponse(status, error, messages) {
	this.timestamp = new Date().toISOString()
	this.status = status
	this.error = error
	this.messages = messages instanceof Array ? messages : [messages]
}