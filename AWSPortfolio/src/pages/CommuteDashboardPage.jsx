
// import Dashboard from '../commuteDashboard/components/Dashboard/Dashboard.jsx'
// import CommuteDataContext from '../commuteDashboard/components/contexts/CommuteDataContext/CommuteDataContext.jsx'

import Dashboard from '../commute-frontend/src/components/Dashboard/Dashboard.jsx'
import CommuteDataContext from '../commute-frontend/src/context/CommuteDataContext.jsx'

export default function CommuteDashboardPage() {
  // return (
  //   <>
  //     <CommuteDataContext Children={Dashboard}/>
  //   </>
  // )

  return (
    <>
      <CommuteDataContext>
        <Dashboard />
      </CommuteDataContext>
    </>
  )
}