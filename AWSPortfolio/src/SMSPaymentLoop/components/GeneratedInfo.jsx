import { useContext } from 'react'
import { ShowInstructionsContext, PayeeDataContext } from './contexts/SMSPaymentDataContext'


export default function GeneratedInfo() {
	const [showInstructions] = useContext(ShowInstructionsContext)
	const [payeeData] = useContext(PayeeDataContext)

	return (
		<>
			{!showInstructions && payeeData && (
				<div>
					<h3>Initial Generated Payee Data</h3>
					<h4>Payee Info</h4>
					<p>First Name: {payeeData.payee.firstName}</p>
					<p>Last Name: {payeeData.payee.lastName}</p>
					<p>Phone Number: +{payeeData.payee.phoneNumber}</p>
					<br/>
					<h4>Payment Methods</h4>
					{payeeData.paymentMethods.map((method) => (
						<div>
							<p>Account Number: {method.accountNumber}</p>
							<p>PIN: {method.pin}</p>
							<br/>
						</div>
					))}
					<h4>Payment Interaction</h4>
					<p>Bill ID: {payeeData.paymentInteraction.billId}</p>
					<p>Current Payment Method Account Number: {payeeData.paymentInteraction.currentPaymentMethodAccountNumber}</p>
					<p>State: {payeeData.paymentInteraction.state}</p>
				</div>
				)
			}
		</>
	)
}