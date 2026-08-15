import Stack from 'react-bootstrap/Stack'

import ToggleBar from '../ToggleBar/ToggleBar.jsx'
import CommuteDurationsGraph from '../CommuteDurationsGraph/CommuteDurationsGraph.jsx'
import CommuteTable from '../CommuteTable/CommuteTable.jsx'

export default function CommuteAnalysis() {
	return (
		<Stack className="mx-auto">
			<div className="p-1">
				<ToggleBar />
			</div>
			<div className="p-3">
				<CommuteDurationsGraph />
			</div>
			<div className="p-2">
				<CommuteTable />
			</div>
		</Stack>
	)
}
