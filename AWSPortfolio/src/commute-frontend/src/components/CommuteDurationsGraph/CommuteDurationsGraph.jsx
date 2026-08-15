import Chart from 'react-apexcharts'
import { useState, useEffect } from 'react'

import { useCommuteData } from '../../context/CommuteDataContext.jsx'

export default function CommuteDurationsGraph() {
	const { tripData, activeDay, showMorning } = useCommuteData()

	const [options, setOptions] = useState({
		chart: {
			toolbar: { show: false },
		},
		plotOptions: {
			bar: { horizontal: false },
		},
		title: {
			text: 'Trip Durations for ',
			align: 'center',
		},
		xaxis: {
			labels: { rotate: 45 },
		},
	})

	// The chart needs to be initialized with some data -- without it,
	// there's a bug where on first load, toggling between morning and
	// evening for the default active day doesn't update the chart
	// (changing days and back "unsticks" it). Likely an ordering issue
	// between this component's state updates and apexcharts' own
	// internal render cycle; a non-empty initial series works around it.
	const [series, setSeries] = useState([
		{ data: [{ x: 'category 1', y: [40, 45, 45, 45, 60] }] },
	])

	function mapData(data, morning) {
		if (!data || morning === undefined) return null

		const trips = morning ? data.morning[activeDay] : data.evening[activeDay]
		const mapped = trips.map((trip) => {
			const timestamp = new Date(trip.start_time).toTimeString().substring(0, 5)
			return {
				x: timestamp,
				y: [trip.best_duration, trip.avg_duration, trip.avg_duration, trip.avg_duration, trip.worst_duration],
			}
		})
		return [{ data: mapped }]
	}

	useEffect(() => {
		if (!tripData || !activeDay || showMorning === undefined) return
		setSeries(mapData(tripData, showMorning))
		setOptions((prev) => ({
			...prev,
			title: { ...prev.title, text: 'Trip Durations (in Minutes) for ' + new Date(activeDay).toDateString() },
		}))
	}, [tripData, activeDay, showMorning])

	if (!tripData || !activeDay) return null

	return <Chart options={options} series={series} type="boxPlot" height="300" />
}
