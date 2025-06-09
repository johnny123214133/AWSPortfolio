import React, {useState, useEffect, createContext, useContext} from 'react'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';

import ToggleBar from './ToggleBar.jsx'
import CommuteDurationsGraph from './CommuteDurationsGraph.jsx'
import CommuteTable from './CommuteTable.jsx'

function CommuteAnalysis() {
	
	return (
		<>
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
		</>
	)
}

export default CommuteAnalysis