import { useContext } from 'react'
import { IsLoadingContext, ShowInstructionsContext, PayeeDataContext } from './contexts/SMSPaymentDataContext'

export default function ActiveInteractionInfo() {
	const [showInstructions] = useContext(ShowInstructionsContext)
	const [PayeeData] = useContext(PayeeDataContext)

	return (
		!showInstructions && 
		<>
			<h4 className="my-8 mx-10">Coming Soon: Live feedback</h4>
		</>
	)
}