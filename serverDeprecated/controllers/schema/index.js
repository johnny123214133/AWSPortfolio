import { LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX } from "../../utils/constants.js"

export var createLocationRequestSchema = {
	"id" : "/CreateLocationRequest",
	"type" : "object",
	"properties" : {
		"address" : { "type" : "string" },
		"lat" : { "type" : "number", "minimum" : LAT_MIN, "maximum" : LAT_MAX },
		"lng" : { "type" : "number", "minimum" : LNG_MIN, "maximum" : LNG_MAX }
	},
	"required" : ["address", "lat", "lng"]
}

export var createRouteRequestSchema = {
	"id" : "/CreateRouteRequest",
	"type" : "object",
	"properties" : {
		"originId" : { "type" : "integer", "minimum" : 1 },
		"destId" : { "type" : "integer", "minimum" : 1 }
	},
	"required" : ["originId", "destId"]
}

export var createTripRequestSchema = {
	"id" : "/CreateTripRequest",
	"type" : "object",
	"properties" : {
		"routeId" : { "type" : "integer", "minimum" : 1 },
		"startTime" : { "type" : "integer"},
		"bestDuration" : { "type" : "integer", "minimum" : 0 },
		"avgDuration" : { "type" : "integer", "minimum" : 0 },
		"worstDuration" : { "type" : "integer", "minimum" : 0 },
	},
	"required" : ["routeId", "startTime", "bestDuration", "avgDuration", "worstDuration"]
}

export var createPayeeRequestSchema = {
	"id" : "/CreatePayeeRequest",
	"type" : "object",
	"properties" : {
		"firstName" : { "type" : "string" },
		"lastName" : { "type" : "string" },
		"phoneNumber" : { "type" : "string", "pattern" : "^[0-9]{7,15}$" },
	},
	"required" : ["firstName", "lastName", "phoneNumber"]
}

export var createPaymentMethodRequestSchema = {
	"id" : "/CreatePaymentMethodRequest",
	"type" : "object",
	"properties" : {
		"payeePhoneNumber" : { "type" : "string", "pattern" : "^[0-9]{7,15}$" },
		"accountNumber" : { "type" : "integer", "minimum" : 1000, "maximum" : 9999 },
		"pin" : { "type" : "integer", "minimum" : 0, "maximum" : 9999 },
	},
	"required" : ["payeePhoneNumber", "accountNumber", "pin"]
}

export var createPaymentInteractionRequestSchema = {
	"id" : "/CreatePaymentInteractionRequest",
	"type" : "object",
	"properties" : {
		"payeePhoneNumber" : { "type" : "string", "pattern" : "^[0-9]{7,15}$" },
		"currentPaymentMethodId" : { "type" : "integer" },
		"billId" : { "type" : "integer", "minimum" : 1000, "maximum" : 9999 },
		"state" : { "type" : "string", "enum" : [
			"InteractionInitiated", 
			"InteractionDelayed",
			"ConfirmPaymentAccount",
			"PaymentConfirmed",
			"ChangePaymentAccount",
			"InvalidResponse",
			"InternalError",
			"ConfirmPIN",
			"DeletePayee"
		]},
		"invalidResponseCounter" : { "type" : "integer", "minimum" : 0, "maximum" : 4 },
	},
	"required" : ["payeePhoneNumber", "currentPaymentMethodId", "billId", "state", "invalidResponseCounter"]
}







