
import Dashboard from '../commuteDashboard/components/Dashboard/Dashboard.jsx'
import CommuteDataContext from '../commuteDashboard/components/contexts/CommuteDataContext/CommuteDataContext.jsx'

export default function CommuteDashboardPage() {
  return (
    <>
      <CommuteDataContext Children={Dashboard}/>
    </>
  )
}