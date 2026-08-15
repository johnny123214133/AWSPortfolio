import { APIProvider, Map, useMapsLibrary, useMap } from '@vis.gl/react-google-maps'
import { useState, useEffect } from 'react'
import MediaQuery from 'react-responsive'

import { useCommuteData } from '../../context/CommuteDataContext.jsx'
import { LG_CUTOFF } from '../../utils/constants.js'

/**
 * Unlike the other responsive components in this app (see
 * ../../styles/responsive.css), this one keeps react-responsive's
 * actual conditional mount/unmount instead of a CSS display:none
 * swap. CSS-hiding both versions would still instantiate two live
 * Google Maps instances simultaneously -- real API/rendering cost, not
 * just a cosmetic difference -- so the tradeoff that's fine everywhere
 * else isn't fine here.
 */
export default function GoogleMap() {
	const { routeData } = useCommuteData()

	if (!routeData) return null

	return (
		<>
			<MediaQuery minWidth={LG_CUTOFF + 1}>
				<div style={{ width: '40vw', height: '80vh' }}>
					<CommuteMap />
				</div>
			</MediaQuery>
			<MediaQuery maxWidth={LG_CUTOFF}>
				<div style={{ width: '100%', height: '80vh' }}>
					<CommuteMap />
				</div>
			</MediaQuery>
		</>
	)
}

function CommuteMap() {
	return (
		<APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
			<Map
				fullscreenControl={false}
				defaultCenter={{ lat: 40.76972, lng: -111.89056 }}
				defaultZoom={10}
				mapId={import.meta.env.VITE_COMMUTE_MAP_ID}
			>
				<Directions />
			</Map>
		</APIProvider>
	)
}

function Directions() {
	const map = useMap()
	const routesLibrary = useMapsLibrary('routes')
	const [directionsService, setDirectionsService] = useState()
	const [directionsRenderer, setDirectionsRenderer] = useState()
	const { routeData } = useCommuteData()

	useEffect(() => {
		if (!map || !routesLibrary) return
		setDirectionsService(new routesLibrary.DirectionsService())
		setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }))
	}, [map, routesLibrary])

	useEffect(() => {
		if (!directionsService || !directionsRenderer || !routeData) return
		directionsService
			.route({
				origin: routeData.origin.address,
				destination: routeData.destination.address,
				travelMode: google.maps.TravelMode.DRIVING,
				provideRouteAlternatives: false,
			})
			.then((response) => {
				directionsRenderer.setDirections(response)
				map.fitBounds(response.routes[0].bounds)
			})
	}, [directionsService, directionsRenderer, routeData])

	return null
}
