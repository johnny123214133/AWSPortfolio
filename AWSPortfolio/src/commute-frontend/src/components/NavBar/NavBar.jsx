import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

import { useCommuteData } from '../../context/CommuteDataContext.jsx'
import { HOUR_TO_MINUTES, MINUTE_TO_MILLISECONDS } from '../../utils/constants.js'

import './NavBar.css'

export default function NavBar() {
	const { submitParams, showMorning, setShowMorning } = useCommuteData()

	const [morningTime, setMorningTime] = useState('')
	const [eveningTime, setEveningTime] = useState('')
	const [startDate, setStartDate] = useState('')

	const navigate = useNavigate()

	const [input, setInput] = useState({
		originAddress: '',
		destinationAddress: '',
		startDate: new Date().setHours(0, 0, 0, 0),
		morningTimeDelta: [0, 0],
		eveningTimeDelta: [0, 0],
	})

	const handleNavigation = (event) => {
		navigate('/' + event.currentTarget.getAttribute('route'))
	}

	function handleOriginChange(event) {
		setInput({ ...input, originAddress: event.target.value })
	}

	function handleDestinationChange(event) {
		setInput({ ...input, destinationAddress: event.target.value })
	}

	function handleDateChange(event) {
		const dateString = event.target.value
		setStartDate(dateString)
		const [year, month, day] = dateString.split('-')
		setInput({ ...input, startDate: new Date(`${month}-${day}-${year}`).getTime() })
	}

	function handleMorningTimeChange(event) {
		setMorningTime(event.target.value)
		setInput({ ...input, morningTimeDelta: event.target.value.split(':').map(Number) })
	}

	function handleEveningTimeChange(event) {
		setEveningTime(event.target.value)
		setInput({ ...input, eveningTimeDelta: event.target.value.split(':').map(Number) })
	}

	function handleToggleMorningSwitch() {
		setShowMorning(!showMorning)
	}

	function adjustTime(startTime, timeDelta) {
		return startTime + (timeDelta[0] * HOUR_TO_MINUTES + timeDelta[1]) * MINUTE_TO_MILLISECONDS
	}

	function validateInput() {
		if (typeof input.originAddress !== 'string' || input.originAddress.length < 1) {
			throw 'Origin address must be a string of length greater than 0.'
		}
		if (typeof input.destinationAddress !== 'string' || input.destinationAddress.length < 1) {
			throw 'Destination address must be a string of length greater than 0.'
		}
		if (input.startDate < new Date().setHours(0, 0, 0, 0)) {
			throw 'Start date must be today or a future date.'
		}
		// NOTE: previously read input.startTime here, which was never a
		// field on `input` (the actual field is startDate) -- these two
		// checks always compared against `undefined` and silently passed
		// regardless of the actual time entered. Fixed to use startDate.
		if (adjustTime(input.startDate, input.morningTimeDelta) < new Date().getTime()) {
			throw 'Morning start date and time must be now or in the future.'
		}
		if (adjustTime(input.startDate, input.eveningTimeDelta) < new Date().getTime()) {
			throw 'Evening start date and time must be now or in the future.'
		}
		if (
			input.morningTimeDelta[0] > input.eveningTimeDelta[0] ||
			(input.morningTimeDelta[0] === input.eveningTimeDelta[0] &&
				input.morningTimeDelta[1] > input.eveningTimeDelta[1])
		) {
			throw 'Morning start time must not be later than evening start time.'
		}
	}

	function handleSubmit(event) {
		event.preventDefault()
		try {
			validateInput()
			submitParams(input)
		}
		catch (err) {
			alert(err)
		}
	}

	return (
		<>
			{/*
				Both versions now always mount, with CSS (desktop-only /
				mobile-only, see ../../styles/responsive.css) controlling
				which is visible -- replacing react-responsive's conditional
				mount/unmount. Since both are in the DOM simultaneously now,
				every id/controlId below needed a unique "Mobile" suffix on
				the second copy to avoid duplicate DOM ids, which weren't a
				problem before when only one tree was ever mounted at once.
			*/}

			{/* large format */}
			<Navbar className="p-0 bg-white desktop-only" sticky="top" expand="lg">
				<Container fluid>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Stack className="pt-3 px-2 bg-white" direction="vertical">
							<Row className="pt-1">
								<Col md={6}>
									<Form.Group as={Row} className="mb-1" controlId="originInput">
										<Form.Label column sm={4} md={4}>
											<b>Origin Address</b>
										</Form.Label>
										<Col sm={8} md={8}>
											<Form.Control
												type="text"
												value={input.originAddress}
												onChange={handleOriginChange}
												placeholder="1234 Main St. Anytown, US"
											/>
										</Col>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Row>
										<Col md={7}>
											<Form.Group as={Row} className="mb-1" controlId="morningStartTimeInput">
												<Col sm={8} md={7}>
													<Form.Label column>
														<b>Morning Start Time</b>
													</Form.Label>
												</Col>
												<Col sm={4} md={5}>
													<Form.Control type="time" value={morningTime} onChange={handleMorningTimeChange} />
												</Col>
											</Form.Group>
										</Col>
										<Col md={5}>
											<Form.Group as={Row} className="mb-1" controlId="startDateInput">
												<Col sm={6} md={5}>
													<Form.Label column>
														<b>Start Date</b>
													</Form.Label>
												</Col>
												<Col sm={6} md={7}>
													<Form.Control type="date" value={startDate} onChange={handleDateChange} />
												</Col>
											</Form.Group>
										</Col>
									</Row>
								</Col>
							</Row>
							<Row className="my-2">
								<Col md={6}>
									<Form.Group as={Row} className="mb-1" controlId="destinationInput">
										<Col sm={4} md={4}>
											<Form.Label column>
												<b>Destination Address</b>
											</Form.Label>
										</Col>
										<Col sm={8} md={8}>
											<Form.Control
												type="text"
												value={input.destinationAddress}
												onChange={handleDestinationChange}
												placeholder="5678 Center St. Anytown, US"
											/>
										</Col>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Row>
										<Col md={7}>
											<Form.Group as={Row} className="mb-1" controlId="eveningStartTimeInput">
												<Col sm={8} md={7}>
													<Form.Label column>
														<b>Evening Start Time</b>
													</Form.Label>
												</Col>
												<Col sm={4} md={5}>
													<Form.Control type="time" value={eveningTime} onChange={handleEveningTimeChange} />
												</Col>
											</Form.Group>
										</Col>
										<Col md={5} className="align-middle">
											<Stack direction="horizontal" className="mb-1">
												<Button className="ms-auto" variant="secondary" onClick={handleSubmit}>
													Submit
												</Button>
											</Stack>
										</Col>
									</Row>
								</Col>
							</Row>
						</Stack>
					</Navbar.Collapse>
				</Container>
			</Navbar>

			{/* small format */}
			<Navbar className="px-3 pt-3 bg-white mobile-only" sticky="top" expand="lg">
				<Container fluid>
					<Navbar.Toggle aria-controls="basic-navbar-nav-mobile" />
					<Navbar.Collapse id="basic-navbar-nav-mobile">
						<Stack className="mb-2 px-2 bg-white" direction="vertical">
							<Form.Group className="mb-1" controlId="originInputMobile">
								<Form.Label>
									<b>Origin Address</b>
								</Form.Label>
								<Form.Control
									type="text"
									value={input.originAddress}
									onChange={handleOriginChange}
									placeholder="1234 Main St. Anytown, US"
								/>
							</Form.Group>
							<Form.Group className="mb-1" controlId="destinationInputMobile">
								<Form.Label>
									<b>Destination Address</b>
								</Form.Label>
								<Form.Control
									type="text"
									value={input.destinationAddress}
									onChange={handleDestinationChange}
									placeholder="5678 Center St. Anytown, US"
								/>
							</Form.Group>
							<Form.Group className="mb-1" controlId="morningStartTimeInputMobile">
								<Form.Label>
									<b>Morning Start Time</b>
								</Form.Label>
								<Form.Control type="time" value={morningTime} onChange={handleMorningTimeChange} />
							</Form.Group>
							<Form.Group className="mb-1" controlId="eveningStartTimeInputMobile">
								<Form.Label>
									<b>Evening Start Time</b>
								</Form.Label>
								<Form.Control type="time" value={eveningTime} onChange={handleEveningTimeChange} />
							</Form.Group>
							<Form.Group className="mb-1" controlId="startDateInputMobile">
								<Form.Label>
									<b>Start Date</b>
								</Form.Label>
								<Form.Control type="date" value={startDate} onChange={handleDateChange} />
							</Form.Group>
							<Button className="mt-2" variant="secondary" onClick={handleSubmit}>
								Submit
							</Button>
						</Stack>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</>
	)
}
