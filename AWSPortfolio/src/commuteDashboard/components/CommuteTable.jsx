import { useContext, useState, useEffect } from 'react'
import { TripDataContext, ActiveDayContext, ShowMorningContext } from './contexts/CommuteDataContext/CommuteDataContext.jsx'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Table from 'react-bootstrap/Table';

import MediaQuery from "react-responsive";
import { LG_CUTOFF } from '../utils/constants.js'

export default function CommuteTable() {
	const [tripData] = useContext(TripDataContext)
	const [activeDay, setActiveDay] = useContext(ActiveDayContext)
	const [showMorning, setShowMorning] = useContext(ShowMorningContext)

	const [activeDayData, setActiveDayData] = useState()
	const [arrivalEstimates, setArrivalEstimates] = useState()

	function addMinutes(date, minutes) {
		return parseTime(new Date(date.getTime() + minutes*60000));
	}
	function parseTime(timestamp) {
		return timestamp.toTimeString().substring(0,5)
	}

	useEffect(() => {
		if (!tripData || !activeDay || typeof showMorning === undefined) return
		
		let data = showMorning ? tripData.morning[activeDay] : tripData.evening[activeDay]
		// var newData = []
		let arrivals = {
			departureTimes : [],
			bestArrivalTimes : [],
			avgArrivalTimes : [],
			worstArrivalTimes : []
		}
		data.forEach(datum => {
			var timestamp = new Date(datum.start_time) 
			arrivals.departureTimes.push(parseTime(timestamp))
			arrivals.bestArrivalTimes.push(addMinutes(timestamp, datum.best_duration))
			arrivals.avgArrivalTimes.push(addMinutes(timestamp, datum.avg_duration))
			arrivals.worstArrivalTimes.push(addMinutes(timestamp, datum.worst_duration))
		})
		console.log(arrivals)
		setArrivalEstimates(arrivals)
		// console.log('ACTIVE DATE DATA')
		// console.log(activeDateData)
	}, [tripData, activeDay, showMorning])

	return (
		<>
			<MediaQuery minWidth={LG_CUTOFF + 1}>
				{tripData && activeDay && arrivalEstimates && (
					<Table striped="columns" responsive style={{fontSize: 12}}>
						<tbody>
						<tr>
							<td><b>Departure Time</b></td>
							{/*<td>{arrivalEstimates.departureTimes.length}</td>*/}
							{arrivalEstimates.departureTimes.map(element => {
								return (
									<td style={{fontSize: 11}} key={'d_' + element}><b>{element}</b></td>
								)
							})}
						</tr>
						<tr>
							<td>Best Case Arrival Time</td>
							{arrivalEstimates && arrivalEstimates.bestArrivalTimes.map(element => {
								return (
									<td key={'b_' + element}>{element}</td>
								)
							})}
						</tr>
						<tr>
							<td>Avg. Case Arrival Time</td>
							{arrivalEstimates && arrivalEstimates.avgArrivalTimes.map(element => {
								return (
									<td key={'a_' + element}>{element}</td>
								)
							})}
						</tr>
						<tr>
							<td>Worst Case Arrival Time</td>
							{arrivalEstimates && arrivalEstimates.worstArrivalTimes.map(element => {
								return (
									<td key={'w_' + element}>{element}</td>
								)
							})}
						</tr>
						</tbody>
					</Table>
				)}
			</MediaQuery>
			<MediaQuery maxWidth={LG_CUTOFF}>
				{tripData && activeDay && arrivalEstimates && (
					<Table striped responsive style={{fontSize: 12}}>
						<thead>
							<tr>
								<th><b>Departure Time</b></th>
								<th>Best Case Arrival Time</th>
								<th>Avg. Case Arrival Time</th>
								<th>Worst Case Arrival Time</th>
							</tr>
						</thead>
						<tbody>
							{(function (rows, i, len) {
								while (i < len) {
									rows.push(
										<tr key={i}>
											<td key={'d_' + i}>{arrivalEstimates.departureTimes[i]}</td>
											<td key={'b_' + i}>{arrivalEstimates.bestArrivalTimes[i]}</td>
											<td key={'a_' + i}>{arrivalEstimates.avgArrivalTimes[i]}</td>
											<td key={'w_' + i}>{arrivalEstimates.worstArrivalTimes[i]}</td>
										</tr>
									)
									i++
								}
								return rows;
							})([], 0, arrivalEstimates.departureTimes.length)}
						</tbody>
					</Table>
				)}
			</MediaQuery>
		</>
	)
}
