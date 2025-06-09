import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import CommuteDashboardPage from "./pages/CommuteDashboardPage";
import SMSPaymentLoopPage from "./pages/SMSPaymentLoopPage";
import NoPage from "./pages/NoPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route index element={<Home />} />
            <Route path="commuteDashboard" element={<CommuteDashboardPage />} />
            <Route path="smsPaymentLoop" element={<SMSPaymentLoopPage />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
