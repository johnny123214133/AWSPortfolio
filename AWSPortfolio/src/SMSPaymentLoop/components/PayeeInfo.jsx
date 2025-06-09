import { useContext } from 'react'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'

import { IsLoadingContext, ShowInstructionsContext } from './contexts/SMSPaymentDataContext'
import ActiveInteractionInfo from './ActiveInteractionInfo'
import GeneratedInfo from './GeneratedInfo'

export default function PayeeInfo() {
	const [isLoading] = useContext(IsLoadingContext)
	const [showInstructions] = useContext(ShowInstructionsContext)

	return (
		<>
		{showInstructions && (
				<div >
					<h2>SMS Payment Loop</h2>
					<p>This is a simulated interaction loop for a user authorizing a payment over SMS. </p>
					<p>It's a simple app to showcase the interaction between Twilio, AWS, and the user.</p>
					<b>I am waiting on A2P Registration approval before building out the loop.</b> 
					<p>But the intended architecture is provided.</p>
					<h2>Usage</h2>
					<ul className="text-start">
						<li>Enter your name and phone number in the form on this page</li>
						<li>Click Register Payee. Generated info for your simulation will appear below.</li>
						<li>If you wish to delete the payee associated with a given phone number, enter the phone number and click Delete Payee.
							<br/>* Note: Only one payee can be coupled to a single phone number at a time.
						</li>
						<li>Click on Start Interaction to start the payment interaction over SMS</li>
					</ul>
				</div>
			)}
			{isLoading &&  (<div style={{height: "80vh"}}><h1 className="m-2">Loading...</h1></div>) }
			{!isLoading && (
					<Stack direction="vertical" gap={2}>
						<div className="p-2"><ActiveInteractionInfo /></div>
						<div className="p-2"><GeneratedInfo /></div> 
					</Stack>
			)}
		</>
	)
}