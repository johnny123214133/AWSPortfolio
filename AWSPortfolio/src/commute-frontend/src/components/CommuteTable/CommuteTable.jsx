import { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table'

import { useCommuteData } from '../../context/CommuteDataContext.jsx'

export default function CommuteTable() {
	const { tripData, activeDay, showMorning } = useCommuteData()
	const [arrivalEstimates, setArrivalEstimates] = useState()

	function addMinutes(date, minutes) {
		return parseTime(new Date(date.getTime() + minutes * 60000))
	}
	function parseTime(timestamp) {
		return timestamp.toTimeString().substring(0, 5)
	}

	useEffect(() => {
		// NOTE: previously `typeof showMorning === undefined`, comparing
		// a string (what typeof always returns) against the value
		// undefined -- that's never true, so this guard never actually
		// fired. Fixed to check showMorning itself.
		if (!tripData || !activeDay || showMorning === undefined) return

		const data = showMorning ? tripData.morning[activeDay] : tripData.evening[activeDay]
		const arrivals = {
			departureTimes: [],
			bestArrivalTimes: [],
			avgArrivalTimes: [],
			worstArrivalTimes: [],
		}
		data.forEach((datum) => {
			const timestamp = new Date(datum.start_time)
			arrivals.departureTimes.push(parseTime(timestamp))
			arrivals.bestArrivalTimes.push(addMinutes(timestamp, datum.best_duration))
			arrivals.avgArrivalTimes.push(addMinutes(timestamp, datum.avg_duration))
			arrivals.worstArrivalTimes.push(addMinutes(timestamp, datum.worst_duration))
		})
		setArrivalEstimates(arrivals)
	}, [tripData, activeDay, showMorning])

	if (!tripData || !activeDay || !arrivalEstimates) return null

	return (
		<>
			<Table striped="columns" responsive style={{ fontSize: 12 }} className="desktop-only">
				<tbody>
					<tr>
						<td>
							<b>Departure Time</b>
						</td>
						{arrivalEstimates.departureTimes.map((time, i) => (
							<td style={{ fontSize: 11 }} key={`departure-${i}`}>
								<b>{time}</b>
							</td>
						))}
					</tr>
					<tr>
						<td>Best Case Arrival Time</td>
						{arrivalEstimates.bestArrivalTimes.map((time, i) => (
							<td key={`best-${i}`}>{time}</td>
						))}
					</tr>
					<tr>
						<td>Avg. Case Arrival Time</td>
						{arrivalEstimates.avgArrivalTimes.map((time, i) => (
							<td key={`avg-${i}`}>{time}</td>
						))}
					</tr>
					<tr>
						<td>Worst Case Arrival Time</td>
						{arrivalEstimates.worstArrivalTimes.map((time, i) => (
							<td key={`worst-${i}`}>{time}</td>
						))}
					</tr>
				</tbody>
			</Table>

			<Table striped responsive style={{ fontSize: 12 }} className="mobile-only">
				<thead>
					<tr>
						<th>
							<b>Departure Time</b>
						</th>
						<th>Best Case Arrival Time</th>
						<th>Avg. Case Arrival Time</th>
						<th>Worst Case Arrival Time</th>
					</tr>
				</thead>
				<tbody>
					{arrivalEstimates.departureTimes.map((_, i) => (
						<tr key={i}>
							<td>{arrivalEstimates.departureTimes[i]}</td>
							<td>{arrivalEstimates.bestArrivalTimes[i]}</td>
							<td>{arrivalEstimates.avgArrivalTimes[i]}</td>
							<td>{arrivalEstimates.worstArrivalTimes[i]}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	)
}
