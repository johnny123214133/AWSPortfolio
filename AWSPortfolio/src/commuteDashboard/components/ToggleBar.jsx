import React, { useState, useEffect, useContext } from 'react'

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Stack from 'react-bootstrap/Stack'

import { ActiveDayContext, WeekdaysContext, ShowMorningContext} from './contexts/CommuteDataContext/CommuteDataContext.jsx'

export default function ToggleBar() {
	const [activeDay, setActiveDay] = useContext(ActiveDayContext)
	const [days] = useContext(WeekdaysContext)
	const [dayNames, setDayNames] = useState()
	const [showMorning, setShowMorning] = useContext(ShowMorningContext)

	useEffect(() => {
		if (!activeDay || !days || !days.includes(activeDay)) return
		let dateMap = days.map(day => {
			let name = new Date(day).toDateString()
			name = name.substring(4, name.length - 5)
			console.log(day + ' ' + name)
			return [day, name] 
		})
		console.log('dateMap:')
		console.log(dateMap)
		setDayNames(dateMap)
	}, [days])

	function handleClick(event) {
		console.log('old',activeDay)
		console.log('new', event.currentTarget.getAttribute('day'))
		setActiveDay(parseInt(event.currentTarget.getAttribute('day')))
	}
	function handleToggleMorning(event) {
		setShowMorning(!showMorning)
	}

	return (
		<>
			{dayNames && (
				<Stack direction="horizontal">
					<ButtonGroup aria-label="Basic example">
						{dayNames.map((day) => {
								return (
									<Button key={day[0]} variant="secondary" onClick={handleClick} day={day[0]}>{day[1]}</Button>
								)
							})
						}
					</ButtonGroup>
					<Button className="ms-auto" variant="secondary" onClick={handleToggleMorning} >{showMorning ? "Showing Morning" : "Showing Evening"}</Button>
				</Stack>
			)}
		</>
	)
}