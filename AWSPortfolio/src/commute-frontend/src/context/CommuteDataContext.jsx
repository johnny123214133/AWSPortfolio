import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getRouteDetails, getTrips } from './functions.js'

const CommuteDataContext = createContext(undefined)

export function useCommuteData() {
	const context = useContext(CommuteDataContext)
	if (context === undefined) {
		throw new Error('useCommuteData must be used within a CommuteDataProvider')
	}
	return context
}

/**
 * The data model for the commute dashboard: takes the form input (via
 * `submitParams`), fetches location/route data and then trip data, and
 * exposes everything downstream via one useCommuteData() hook -- e.g.
 * `const { isLoading } = useCommuteData()` -- instead of eight
 * separately-imported, positionally-destructured contexts.
 *
 * Wrap this around whatever gets routed to. Dashboard arrives here as
 * `props.children` -- an ordinary React children prop, populated by
 * nesting it in JSX:
 *
 *   <CommuteDataProvider>
 *     <Dashboard />
 *   </CommuteDataProvider>
 *
 * (Previously this destructured a prop literally named `Children`
 * (capital C) and rendered `<Children />` -- not React's actual
 * children prop, so it would have rendered undefined. Fixed here.)
 */
export default function CommuteDataProvider({ children }) {
	const [params, setParams] = useState()
	const [routeData, setRouteData] = useState()
	const [tripData, setTripData] = useState()
	const [showMorning, setShowMorning] = useState(true)
	const [weekdays, setWeekdays] = useState()
	const [activeDay, setActiveDay] = useState()
	const [isLoading, setIsLoading] = useState(false)
	const [showInstructions, setShowInstructions] = useState(true)

	const resetData = () => {
		setParams(undefined)
		setRouteData(undefined)
		setTripData(undefined)
		setWeekdays(undefined)
		setActiveDay(undefined)
		setShowInstructions(true)
	}

	useEffect(() => {
		// skip on initial mount, and after resetData() rolls params back
		if (!params) return

		// Scoped to this effect run rather than a ref -- the effect's
		// own cleanup (below) aborts it on the next params change or
		// unmount, so a ref that persists across renders isn't needed.
		const abortController = new AbortController()

		const fetchData = async () => {
			setShowInstructions(false)
			setIsLoading(true)

			try {
				const routeDetails = await getRouteDetails(params, abortController.signal)
				setRouteData(routeDetails)

				const trips = await getTrips(routeDetails, abortController.signal)
				setTripData(trips)

				const days = Object.keys(trips.morning)
					.map((day) => parseInt(day, 10))
					.sort((a, b) => a - b)
				setWeekdays(days)
				setActiveDay(days[0])
			}
			catch (error) {
				// A superseded request (the user submitted again before
				// this one finished) aborts intentionally -- that's not a
				// real error and shouldn't reset the UI or alert.
				// Previously ungated, so submitting a new query while one
				// was in flight would show a spurious error alert.
				if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return

				resetData()
				const messages = error.response?.data?.messages
				alert(messages ? messages.join('\n') : 'Unexpected error occurred.')
			}
			finally {
				setIsLoading(false)
			}
		}

		fetchData()

		return () => abortController.abort()
	}, [params])

	const value = useMemo(
		() => ({
			routeData,
			tripData,
			weekdays,
			activeDay,
			setActiveDay,
			showMorning,
			setShowMorning,
			isLoading,
			showInstructions,
			submitParams: setParams,
		}),
		[routeData, tripData, weekdays, activeDay, showMorning, isLoading, showInstructions]
	)

	return <CommuteDataContext.Provider value={value}>{children}</CommuteDataContext.Provider>
}
