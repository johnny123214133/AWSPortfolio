import Chart from 'react-apexcharts'
import React, { useState, useEffect, useContext } from 'react'

import { ActiveDayContext, TripDataContext, ShowMorningContext } from './contexts/CommuteDataContext/CommuteDataContext.jsx'

export default function CommuteDurationsGraph() {
	const [tripData] = useContext(TripDataContext)
	const [activeDay, setActiveDay] = useContext(ActiveDayContext)
	const [showMorning, setShowMorning] = useContext(ShowMorningContext)

	const [options, setOptions] = useState(
	{
		chart : {
			toolbar : {
				show : false
			}
		},
		plotOptions : {
			bar : {
				horizontal : false
			},
		},
		title : {
			text : ('Trip Durations for '),
			align : 'center'
		},
		xaxis: {
			labels: {
				rotate: 45
			}
		}
	})

	// chart needs to be initialized with some data. without it, 
	// there's a weird bug when the first chart loaded where the evening data, 
	// and the morning data won't load for the default active day when toggled. 
	// If you change days and then return to the initial day, the chart works as expected.
	// It likely has to do with the order of state and render updates to the chart
	const [series, setSeries] = useState([{
		data: [
			{
				x: "category 1",
				y: [40, 45, 45, 45, 60]
			}
		]
	}])

	// map data from context to a format apex charts expects
	function mapData(tripsData, showMorning) {
		if (!tripsData || showMorning === undefined) return null
		
		let data = showMorning ? tripData.morning[activeDay] : tripData.evening[activeDay]
		data = data.map(datum => {
			let date = new Date(datum.start_time)
			// let timestamp = `${date.getHours()}:${date.getMinutes()}`
			let timestamp = date.toTimeString().substring(0,5)
			return {
				x: timestamp,
				y: [
					datum.best_duration,
					datum.avg_duration,
					datum.avg_duration,
					datum.avg_duration,
					datum.worst_duration,
				]
			}
		})
		return [{data}]
	}

	useEffect(() => {
		if (!tripData || !activeDay || showMorning === undefined) return
		setSeries(mapData(tripData, showMorning))
		setOptions({...options, title : {...options.title, text : ('Trip Durations (in Minutes) for ' + new Date(activeDay).toDateString())}})
	}, [tripData, activeDay, showMorning])
	
	return (
		<>
			{
				tripData && activeDay && options && series 
				&& (<Chart options={options} series={series} type='boxPlot' height='300'/>)
			}
		</>
	)

}