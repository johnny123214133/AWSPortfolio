import React, { useState, useEffect, createContext, useRef } from 'react'
import { registerPayee, getPayeeData, deletePayee, startPaymentInteraction } from './functions.js'

// handle all the logic and state for collecting form input, 
// fetch payee data
// clean and provide data for the rest of the app's functionality


export const IsLoadingContext = React.createContext()
export const ShowInstructionsContext = React.createContext()

export const PayeeParamsContext = React.createContext()
export const PayeeDataContext = React.createContext()
export const DeletePayeeContext = React.createContext()
export const StartInteractionContext = React.createContext()


export default function SMSPaymentDataContext({Children}) {
	const [isLoading, setIsLoading] = useState(false)
	const [showInstructions, setShowInstructions] = useState(true)

	const [params, setParams] = useState()
	const [payeeData, setPayeeData] = useState()
	const [deletePayeePhoneNumber, setDeletePayeePhoneNumber] = useState('')
	const [startPaymentInteractionPhoneNumber, setStartPaymentInteractionPhoneNumber] = useState('')


	const abortControllerRef = useRef(null)

	// Until I figure out how to group all my state updates 
	// into one atomic unit, I'll have to rely on clearing
	// the states myself and work around any side effects of doing so.
	// But because the data is all modeled and controlled in this component, 
	// it's not as bad as it could be
	const resetData = () => {
		setParams()
		setPayeeData()
		setDeletePayeePhoneNumber('')
		setStartPaymentInteractionPhoneNumber('')
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

				await registerPayee(params, abortControllerRef.current.signal)
				await getPayeeData(params.phoneNumber, abortControllerRef.current.signal)
				.then(data => {
					if (Object.keys(data).length == 0) throw 'No user data retrieved'
					if (Object.keys(data).length < 3) throw 'Partial user data retrieved'
					console.log(data)
					setPayeeData(data)
					setIsLoading(false)
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


	useEffect(() => {
		if (deletePayeePhoneNumber.length < 1) return () => { if (abortControllerRef.current !== null) abortControllerRef.current.abort() }

		const startDeletePayee = async () => {
			try {
				if (abortControllerRef.current !== null) abortControllerRef.current.abort()
				abortControllerRef.current = new AbortController()

				await deletePayee(deletePayeePhoneNumber, abortControllerRef.current.signal)
				resetData()
			}
			catch (error) {
				resetData()
				console.log(error)
				alert('Unexpected error occurred.')
			}
			return () => { if (abortControllerRef.current !== null) abortControllerRef.current.abort() }
		}
		if (!isLoading) {
			startDeletePayee()
		}
	}, [deletePayeePhoneNumber])


	useEffect(() => {
		if (startPaymentInteractionPhoneNumber.length < 1) return () => { if (abortControllerRef.current !== null) abortControllerRef.current.abort() }
		const startInteraction = async () => {

			try {
				if (abortControllerRef.current !== null) abortControllerRef.current.abort()
				abortControllerRef.current = new AbortController()

				setShowInstructions(false)
				setIsLoading(true)
				await getPayeeData(startPaymentInteractionPhoneNumber, abortControllerRef.current.signal)
				.then(data => {					
					console.log(data)
					setPayeeData(data)
					setIsLoading(false)
				})
				startPaymentInteraction(startPaymentInteractionPhoneNumber, abortControllerRef.current.signal)
			}
			catch (error) {
				resetData()
				console.log(error)
				error == 'Could not fetch Payee\'s data' ? alert(error + '. Payee may not exist') : alert('Unexpected error occurred.')				
			}
			finally {
				setIsLoading(false)
			}
			return () => { if (abortControllerRef.current !== null) abortControllerRef.current.abort() }
		}
		if (!isLoading){
			startInteraction()
		}
	}, [startPaymentInteractionPhoneNumber])

	return (
		<>
			<IsLoadingContext.Provider value={[isLoading]}>
			<ShowInstructionsContext.Provider value={[showInstructions]}>
			<PayeeParamsContext.Provider value={[setParams]}>
			<PayeeDataContext.Provider value={[payeeData]}>
			<DeletePayeeContext.Provider value={[setDeletePayeePhoneNumber]}>
			<StartInteractionContext.Provider value={[setStartPaymentInteractionPhoneNumber]}>
					<Children />
			</StartInteractionContext.Provider>
			</DeletePayeeContext.Provider>
			</PayeeDataContext.Provider>
			</PayeeParamsContext.Provider>
			</ShowInstructionsContext.Provider>
			</IsLoadingContext.Provider>
		</>
	)
}
