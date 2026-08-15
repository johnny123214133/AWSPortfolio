import { useState, useEffect } from 'react'

import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Stack from 'react-bootstrap/Stack'

import { useCommuteData } from '../../context/CommuteDataContext.jsx'

import './ToggleBar.css'

export default function ToggleBar() {
	const { activeDay, setActiveDay, weekdays, showMorning, setShowMorning } = useCommuteData()
	const [dayNames, setDayNames] = useState()

	useEffect(() => {
		if (!activeDay || !weekdays || !weekdays.includes(activeDay)) return
		const dateMap = weekdays.map((day) => {
			const fullName = new Date(day).toDateString()
			const shortName = fullName.substring(4, fullName.length - 5)
			return [day, shortName]
		})
		setDayNames(dateMap)
	}, [weekdays])

	function handleDayClick(event) {
		setActiveDay(parseInt(event.currentTarget.getAttribute('day'), 10))
	}
	function handleToggleMorning() {
		setShowMorning(!showMorning)
	}

	if (!dayNames) return null

	const activeDayName = dayNames.find(([day]) => day === activeDay)?.[1]

	return (
		<Stack direction="horizontal" className="align-items-start">
			{/*
				Both versions always mount, with CSS (see ToggleBar.css)
				controlling which is visible at the 1024px breakpoint --
				same pattern used elsewhere in this app (NavBar, Dashboard,
				CommuteTable), safe here since a Dropdown has no expensive
				external resource the way GoogleMap's two-Maps-instances
				problem did.
			*/}

			{/* > 1024px: the original joined button group -- safe again now
			    that this version is never shown at a width narrow enough
			    to wrap (the dropdown below handles that case instead) */}
			<ButtonGroup className="day-selector-buttons" aria-label="Day selector">
				{dayNames.map(([day, name]) => (
					<Button key={day} variant="secondary" onClick={handleDayClick} day={day}>
						{name}
					</Button>
				))}
			</ButtonGroup>

			{/* <= 1024px: a labeled dropdown instead */}
			<Stack direction="horizontal" gap={2} className="day-selector-dropdown align-items-center">
				<b>Day</b>
				<Dropdown>
					<Dropdown.Toggle variant="secondary" id="day-selector-dropdown-toggle">
						{activeDayName}
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{dayNames.map(([day, name]) => (
							<Dropdown.Item key={day} active={day === activeDay} onClick={() => setActiveDay(day)}>
								{name}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			</Stack>

			<Button className="ms-auto" variant="secondary" onClick={handleToggleMorning}>
				{showMorning ? 'Showing Morning' : 'Showing Evening'}
			</Button>
		</Stack>
	)
}