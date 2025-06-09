import React, { useState, useEffect, createContext, useMemo, useRef } from 'react'
import { getRouteDetails, getTrips } from './functions.js'

// handle all the logic and state for collecting form input, 
// fetch location and route data, then trip data,
// clean and provide data for the rest of the app's functionality

export const RouteParamsContext = React.createContext()
export const RouteDataContext = React.createContext()
export const ShowMorningContext = React.createContext()
export const TripDataContext = React.createContext()
export const WeekdaysContext = React.createContext()
export const ActiveDayContext = React.createContext()
export const IsLoadingContext = React.createContext()
export const ShowInstructionsContext = React.createContext()

export default function CommuteDataContext({Children}) {
	const [params, setParams] = useState()
	const [routeData, setRouteData] = useState()
	const [tripData, setTripData] = useState()
	const [showMorning, setShowMorning] = useState(true)
	const [weekdays, setWeekdays] = useState()
	const [activeDay, setActiveDay] = useState()
	const [isLoading, setIsLoading] = useState(false)
	const [showInstructions, setShowInstructions] = useState(true)

	const abortControllerRef = useRef(null)

	// Until I figure out how to group all my state updates 
	// into one atomic unit, I'll have to rely on clearing
	// the states myself and work around any side effects of doing so.
	// But because the data is all modeled and controlled in this component, 
	// it's not as bad as it could be
	const resetData = () => {
		setParams()
		setRouteData()
		setTripData()
		setWeekdays()
		setActiveDay()
		setShowInstructions(true)
	}

	useEffect(() => {
		// prevent calls on initial mount, and when state gets rolled back from errors
		if (!params) return

		const fetchData = async () => {
			try {
				// instantiate an abort controller to prevent race conditions
				if (abortControllerRef.current !== null) abortControllerRef.current.abort()
				abortControllerRef.current = new AbortController()
				
				// show lodaing message while data is loading
				setShowInstructions(false)
				setIsLoading(true)
				// fetch and set location and route details
				await getRouteDetails(params, abortControllerRef.current.signal)
				.then(data => {
					setRouteData(data)
					return data
				}).then(params => {
					// fetch and set trip data for the returned routes
					return getTrips(params, abortControllerRef.current.signal)
				}).then(trips => {
					console.log(trips)
					setTripData(trips)
					// create and set state for daily charts and tables
					let days = Object.keys(trips.morning)
					days = days.map(day => parseInt(day))
					days.sort()
					setWeekdays(days)
					setActiveDay(days[0])
					setIsLoading(false)
				})
				.catch(error => {
					console.log(error)
					resetData()
					const message = error.response.data.messages ? error.response.data.messages.join('\n') : error
					alert(error.response.data.messages.join('\n'))
				})
			}
			catch (error) {
				resetData()
				console.log(error)
				alert('Unexpected error occurred.')				
			}
			finally {
				setIsLoading(false)
			}
			return () => { if (abortControllerRef.current !== null) abortControllerRef.current.abort() }
		}
		if (!isLoading) {
			fetchData()
		}
	  // return () => { setIsLoading(false) }
	}, [params])

	return (
		<>
			<IsLoadingContext.Provider value={[isLoading]}>
			<ShowInstructionsContext.Provider value={[showInstructions]}>
			<RouteParamsContext.Provider value={[setParams]}>
				<RouteDataContext.Provider value={[routeData]}>
				<ShowMorningContext.Provider value={[showMorning, setShowMorning]}>
				<TripDataContext.Provider value={[tripData]}>
				<WeekdaysContext.Provider value={[weekdays]}>
				<ActiveDayContext.Provider value={[activeDay, setActiveDay]}>
					<Children />
				</ActiveDayContext.Provider>
				</WeekdaysContext.Provider>
				</TripDataContext.Provider>
				</ShowMorningContext.Provider>
				</RouteDataContext.Provider >
			</RouteParamsContext.Provider>
			</ShowInstructionsContext.Provider>
			</IsLoadingContext.Provider>
		</>
	)
}
