import appArchitectureDiagram from '../../assets/SMSPaymentAppArchitecture.svg'

export default function AppArchitecture() {

	return (
		<>
		<h4>SMS Payment Loop Architecture</h4>
			<img src={appArchitectureDiagram} style={{width: "80%"}} alt="Architecture diagram" />
		</>
	)
}