import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

import { useContext, useState } from 'react'
import { PayeeParamsContext, DeletePayeeContext, StartInteractionContext } from './contexts/SMSPaymentDataContext'

export default function PayeeForm() {
	const [setParams] = useContext(PayeeParamsContext)
	const [setDeletePayeePhoneNumber] = useContext(DeletePayeeContext)
	const [setStartPaymentInteractionPhoneNumber] = useContext(StartInteractionContext)
	// const [PayeeData] = useContext(PayeeDataContext)
	const [input, setInput] = useState({
		firstName: '',
		lastName : '',
		phoneNumber: ''
	})

	function handleFirstNameChange(event) {
		setInput({...input, firstName : event.target.value})
	}

	function handleLastNameChange(event) {
		setInput({...input, lastName : event.target.value})
	}

	function handlePhoneNumberChange(value) {
		console.log(event)
		setInput({...input, phoneNumber : value})
	}

	function validateInput() {
		if (typeof input.firstName !== 'string' || input.firstName.length < 1) {
			throw 'First name must be a string of length greater than 0.'
		}
		if (typeof input.lastName !== 'string' || input.lastName.length < 1) {
			throw 'Last name must be a string of length greater than 0.'
		}
		if (typeof input.phoneNumber !== 'string' || input.phoneNumber.length < 8) {
			throw 'Phone number must be a valid E.164 (e.x. +12223334444 for US numbers) phone number at least 7 digits long.'
		}
		if (typeof input.phoneNumber !== 'string' || input.phoneNumber.length > 16) {
			throw 'Phone number must be a valid E.164 (e.x. +12223334444 for US numbers) phone number at most 15 digits long.'
		}
	}

	function validatePhoneNumber() {
		if (typeof input.phoneNumber !== 'string' || input.phoneNumber.length < 8) {
			throw 'Phone number must be a valid E.164 phone number (e.x. +12223334444 for US numbers) at least 7 digits long.'
		}
		if (typeof input.phoneNumber !== 'string' || input.phoneNumber.length > 16) {
			throw 'Phone number must be a valid E.164 phone number (e.x. +12223334444 for US numbers) at most 15 digits long.'
		}
		if (input.phoneNumber[0] != '+') {
			throw 'Phone number must be a valid E.164 number (e.x. +12223334444 for US numbers)'
		}

	}

	function handleSubmit(event) {
		try {
			event.preventDefault()
			console.log(input)
			validateInput()
			setParams(input)
		} 
		catch (err) {
			alert(err)
		}
	}

	function handleDeletePayee(event) {
		try {
			event.preventDefault()
			console.log(input)
			validatePhoneNumber()
			setDeletePayeePhoneNumber(input.phoneNumber)
			alert('Deleting Payee')
		} 
		catch (err) {
			alert(err)
			setDeletePayeePhoneNumber('')
		}
	}

	function handleStartInteraction(event) {
		try {
			event.preventDefault()
			console.log(input)
			validatePhoneNumber()
			setStartPaymentInteractionPhoneNumber(input.phoneNumber)
		} 
		catch (err) {
			alert(err)
			setStartPaymentInteractionPhoneNumber('')
		}
	}

	return (
		<div className="mb-2">
			<h3 className="p-2">Payee Form</h3>	
			<Stack className="pt-3 px-2 bg-white" direction="vertical" gap={3}>
				<Form.Group as={Row} className="mb-1" controlId="originInput">
					<Form.Label column sm={4} md={4}>
						<b>First Name</b>
					</Form.Label>
					<Col sm={8} md={8}>
						<Form.Control type="text" value={input.firstName} onChange={handleFirstNameChange} placeholder="John" />
					</Col>
				</Form.Group>
				<Form.Group as={Row} className="mb-1" controlId="lastNameInput">
					<Form.Label column sm={4} md={4}>
						<b>Last Name</b>
					</Form.Label>
					<Col sm={8} md={8}>
						<Form.Control type="text" value={input.lastName} onChange={handleLastNameChange} placeholder="Doe" />
					</Col>
				</Form.Group>
				<Form.Group as={Row} className="mb-1" controlId="originInput">
					<Form.Label column sm={4} md={4}>
						<b>Phone Number</b>
					</Form.Label>
					<Col sm={8} md={8}>
						<PhoneInput value={input.phoneNumber} onChange={handlePhoneNumberChange} placeholder='+12223334444' />
						{/*<Form.Control type="text" value={input.originAddress} onChange={handleOriginChange} placeholder="1234 Main St. Anytown, US" />*/}
					</Col>
				</Form.Group>
				{/*<ButtonGroup aria-label="Payee Form Buttons">*/}
				<Stack direction="horizontal" gap={2} style={{justifyContent: 'center'}}>
					<Button variant="secondary" onClick={handleSubmit}>Register Payee</Button>
					<Button variant="secondary" onClick={handleStartInteraction}>Start Interaction</Button>
					<Button variant="secondary" onClick={handleDeletePayee}>Delete Payee</Button>
				</Stack>
				{/*</ButtonGroup>*/}
			</Stack>
		</div>
	)
}