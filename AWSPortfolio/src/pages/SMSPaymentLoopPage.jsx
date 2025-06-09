import SMSPaymentApp from '../SMSPaymentLoop/components/SMSPaymentApp/SMSPaymentApp.jsx'
import SMSPaymentDataContext from '../SMSPaymentLoop/components/contexts/SMSPaymentDataContext'

export default function SMSPaymentLoopPage() {
  return (
    <>
      <SMSPaymentDataContext Children={SMSPaymentApp}/>
    </>
  )
}