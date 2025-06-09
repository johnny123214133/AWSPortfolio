import { useContext, useEffect } from 'react'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'

import MediaQuery from "react-responsive"

import NavBar from '../NavBar/NavBar.jsx'
import CommuteAnalysis from '../CommuteAnalysis.jsx'
import GoogleMap from '../GoogleMap.jsx'
import { IsLoadingContext, ShowInstructionsContext } from '../contexts/CommuteDataContext/CommuteDataContext'

import { LG_CUTOFF } from '../../utils/constants.js'

import './Dashboard.css'

function Dashboard() {
	const [isLoading] = useContext(IsLoadingContext)
	const [showInstructions] = useContext(ShowInstructionsContext)
	
	return (
		<div className="px-2">
			<NavBar />
			{showInstructions && (
				<div className="p-4">
					<h2>Commute Dashboard</h2>
					<p>The purpose of this dashboard is to analyze the user's commute. It is built only to handle same-day round trips within a single timezone.</p>
					<p>For a pair of addresses (or Google-recognized locations) and a pair of future departure times on a given day,
						this dashboard displays: </p>
					<ul className="text-start">
						<li>The current best route on a map</li>
						<li>Controls over the current day's data to be displayed</li>
						<li>A toggle between the outgoing and return trips</li>
						<li>
							A graph detailing the best, average, and worst case commute times for the following 2.5 hours, <br/>
							starting after the given start times, incremented every 15 minutes
						</li>
						<li>A table detailing the expected arrival times for every given departure time</li>
					</ul>
					<h2>Usage</h2>
					<ul className="text-start">
						<li>Type in any two addresses or Google-recognized locations in the Origin and Destination fields</li>
						<li>Type in or select any two start times for the outgoing and return trips
							<br/>* Note: the return trip must not be sooner than the outgoing trip
						</li>
						<li>Select a start date
							<br/>* Note: Start date must be today or some future date
						</li>
						<li>Click on Submit</li>
					</ul>
				</div>
			)}
			{isLoading &&  (<div style={{height: "80vh"}}><h1 className="m-2">Loading...</h1><p>Please be patient. Loading up to 420 trips from Google.</p></div>) }
			{!isLoading && (
				<MediaQuery minWidth={LG_CUTOFF + 1}>
					<Stack direction="horizontal" gap={2}>
						<div className="p-2"><GoogleMap /></div>
						<div className="p-2 " style={{width: "100%"}}><CommuteAnalysis /></div>
					</Stack>
				</MediaQuery>
			)}
			{!isLoading && (
				<MediaQuery maxWidth={LG_CUTOFF}>
					<Stack direction="vertical" gap={2}>
						<div className="p-2"><GoogleMap /></div>
						<div className="p-2 " style={{width: "100%"}}><CommuteAnalysis /></div>
					</Stack>
				</MediaQuery>
			)}
		</div>
	)
}

export default Dashboard
