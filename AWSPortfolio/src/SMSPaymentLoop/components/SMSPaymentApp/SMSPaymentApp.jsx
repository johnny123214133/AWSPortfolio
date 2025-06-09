import { useContext, useEffect } from 'react'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'

import MediaQuery from "react-responsive"

import NavBar from '../NavBar/NavBar.jsx'
import PayeeInfo from '../PayeeInfo.jsx'
import PayeeForm from '../PayeeForm.jsx'
import AppArchitecture from '../AppArchitecture.jsx'
import { IsLoadingContext, ShowInstructionsContext } from '../contexts/SMSPaymentDataContext'

import { LG_CUTOFF } from '../../utils/constants.js'

function Dashboard() {
	
	return (
		<div className="px-2" style={{height:'100vh', alignItems: 'center'}}>
			<NavBar />

			<MediaQuery minWidth={LG_CUTOFF + 1}>
				<Stack direction="horizontal" className="d-flex align-items-start" gap={2}>
					<Col md={6}>
						<Row>
							<div className="p-2"><PayeeForm /></div>
						</Row>
						<Row>
							<div className="p-2"><AppArchitecture /></div>
						</Row>
					</Col>
					<Col md={6}>
						<div className="p-2 " style={{width: "100%"}}><PayeeInfo /></div>
					</Col>
				</Stack>
			</MediaQuery>
			<MediaQuery maxWidth={LG_CUTOFF}>
				<Stack direction="vertical" gap={2}>
					<div className="p-2"><PayeeForm /></div>
					<div className="p-2 " style={{width: "100%"}}><PayeeInfo /></div>
					<div className="p-2"><AppArchitecture /></div>
				</Stack>
			</MediaQuery>
		</div>
	)
}

export default Dashboard
