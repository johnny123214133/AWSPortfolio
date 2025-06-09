import Button from 'react-bootstrap/Button'
// import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'

import { useNavigate } from 'react-router-dom';

import MediaQuery from 'react-responsive'

import { LG_CUTOFF } from '../../utils/constants.js'

import './NavBar.css'

function NavBar() {
	const navigate = useNavigate();

	const handleNavigation = (event) => {
    navigate('/' + event.currentTarget.getAttribute('route'));
  };

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
	      				<Button variant="link" onClick={handleNavigation} route='contact' className="navbar-link">SMS Payment Loop</Button>
							</Stack>
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
						<Button variant="link" className="navbar-link"><h5>SMS Payment Loop</h5></Button>
					</Navbar.Brand>
				</Container>
				</Navbar>
			</MediaQuery>
		</>
	)
}

export default NavBar
