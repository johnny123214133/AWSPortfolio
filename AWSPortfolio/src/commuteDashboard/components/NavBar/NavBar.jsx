import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

import { useNavigate } from 'react-router-dom';

import MediaQuery from 'react-responsive'

import { HOUR_TO_MINUTES, MINUTE_TO_MILLISECONDS, LG_CUTOFF } from '../../utils/constants.js'

import './NavBar.css'

import { useState, useContext } from 'react'
import { RouteParamsContext, ShowMorningContext } from '../contexts/CommuteDataContext/CommuteDataContext'

function NavBar() {
	const [setParams] = useContext(RouteParamsContext)
	const [showMorning, setShowMorning] = useContext(ShowMorningContext)
	const [morningTime, setMorningTime] = useState()
	const [eveningTime, setEveningTime] = useState() 
	const [startDate, setStartDate] = useState() 

	const navigate = useNavigate();

	const [input, setInput] = useState({
		originAddress : '',
		destinationAddress : '',
		startDate : new Date().setHours(0, 0, 0, 0),
		morningTimeDelta : [0, 0],
		eveningTimeDelta : [0, 0]
	})

	const handleNavigation = (event) => {
    navigate('/' + event.currentTarget.getAttribute('route'));
  };

	function handleOriginChange(event) {
		setInput({...input, originAddress : event.target.value})
	}

	function handleDestinationChange(event) {
		setInput({...input, destinationAddress : event.target.value})
	}

	function handleDateChange(event) {
		var dateString = event.target.value
		setStartDate(event.target.value)
		var components = dateString.split('-')
		dateString = [components[1], components[2], components[0]].join('-')
    setInput({...input, startDate : new Date(dateString).getTime()})
	}

	function handleMorningTimeChange(event) {
		setMorningTime(event.target.value)
		var components = event.target.value.split(':')
		components = components.map(item => {return Number(item)})
		setInput({...input, morningTimeDelta : components})
	}

	function handleEveningTimeChange(event) {
		setEveningTime(event.target.value)
		var components = event.target.value.split(':')
		components = components.map(item => {return Number(item)})
		setInput({...input, eveningTimeDelta : components})
	}

	function handleToggleMorningSwitch(event) {
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
		if (adjustTime(input.startTime, input.morningTimeDelta) < new Date().getTime()) {
			throw 'Morning start date and time must be now or in the future.'
		}
		if (adjustTime(input.startTime, input.eveningTimeDelta) < new Date().getTime()) {
			throw 'Evening start date and time must be now or in the future.'
		}
		if (input.morningTimeDelta[0] > input.eveningTimeDelta[0] || 
			(input.morningTimeDelta[0] == input.eveningTimeDelta[0] && 
				input.morningTimeDelta[1] > input.eveningTimeDelta[0])
		) {
			throw 'Morning start time must not be later than evening start time.'
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

	return (
		<>
			{/* large format */}
			<MediaQuery minWidth={LG_CUTOFF + 1}>
				<Navbar className="p-0 bg-white" sticky="top" expand="lg">
				<Container fluid>
					
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
					<Stack className="pt-3 px-2 bg-white" direction="vertical">
						<Row>
							<Stack direction="horizontal" gap={3}>
								<Button variant="link" onClick={handleNavigation} route="" className="navbar-link"><b>Zach's Portfolio</b></Button>
								<Button variant="link" onClick={handleNavigation} route='commuteDashboard' className="navbar-link">Commute Dashboard</Button>
	      				<Button variant="link" onClick={handleNavigation} route='smsPaymentLoop' className="navbar-link">SMS Payment Loop</Button>
							</Stack>
						</Row>
						<Row className="pt-1">
							<Col md={6}>
								<Form.Group as={Row} className="mb-1" controlId="originInput">
									<Form.Label column sm={4} md={4}>
										<b>Origin Address</b>
									</Form.Label>
									<Col sm={8} md={8}>
										<Form.Control type="text" value={input.originAddress} onChange={handleOriginChange} placeholder="1234 Main St. Anytown, US" />
									</Col>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Row>
									<Col md={7}>
										<Form.Group as={Row} className="mb-1" controlId="morningStartTimeInput">
											<Col sm={8} md={7}>
												<Form.Label column >
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
												<Form.Label column >
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
										<Form.Label column >
											<b>Destination Address</b>
										</Form.Label>
									</Col>
									<Col sm={8} md={8}>
										<Form.Control type="text" value={input.destinationAddress} onChange={handleDestinationChange} placeholder="5678 Center St. Anytown, US" />
									</Col>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Row>
									<Col md={7}>
										<Form.Group as={Row} className="mb-1" controlId="eveningStartTimeInput">
											<Col sm={8} md={7}>
												<Form.Label column >
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
			</MediaQuery>
			{/* small format */}
			<MediaQuery maxWidth={LG_CUTOFF}>
				<Navbar className="px-3 pt-3 bg-white" sticky="top" expand="lg">
				<Container fluid>
					<Navbar.Brand>
						<Button variant="link" onClick={handleNavigation} route="" className="navbar-link"><h4>Zach's Portfolio</h4></Button>
						<Button variant="link" className="navbar-link"><h5>Commute Dashboard</h5></Button>
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
					<Stack className="mb-2 px-2 bg-white" direction="vertical">
						<Form.Group className="mb-1" controlId="originInput">
							<Form.Label>
								<b>Origin Address</b>
							</Form.Label>
							<Form.Control type="text" value={input.originAddress} onChange={handleOriginChange} placeholder="1234 Main St. Anytown, US" />
						</Form.Group>
						<Form.Group className="mb-1" controlId="destinationInput">
							<Form.Label>
								<b>Destination Address</b>
							</Form.Label>
							<Form.Control type="text" value={input.destinationAddress} onChange={handleDestinationChange} placeholder="5678 Center St. Anytown, US" />
						
						</Form.Group>
						<Form.Group className="mb-1" controlId="morningStartTimeInput">
							<Form.Label>
								<b>Morning Start Time</b>
							</Form.Label>		
							<Form.Control type="time" value={morningTime} onChange={handleMorningTimeChange} />
						</Form.Group>					
						<Form.Group className="mb-1" controlId="eveningStartTimeInput">
							<Form.Label>
								<b>Evening Start Time</b>
							</Form.Label>
							<Form.Control type="time" value={eveningTime} onChange={handleEveningTimeChange} />
						</Form.Group>
						<Form.Group className="mb-1" controlId="startDateInput">
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
			</MediaQuery>
		</>
	)
}

export default NavBar
