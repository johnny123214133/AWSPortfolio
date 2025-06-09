import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleNavigation = (event) => {
    navigate('/' + event.currentTarget.getAttribute('route'));
  };

  return (
    <>
      <Stack direction="vertical" gap={2}>
        <h1>Zach's Portfolio</h1>
        <Button variant="link" onClick={handleNavigation} route='commuteDashboard' className="navbar-link">Commute Dashboard</Button>
        <Button variant="link" onClick={handleNavigation} route='smsPaymentLoop' className="navbar-link">SMS Payment Loop</Button>
      </Stack>
    </>
  )
}