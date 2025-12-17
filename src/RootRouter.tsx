import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import EVChargersApp from './EVChargersApp.tsx';

export default function RootRouter() {
  return (
    <Routes>
      <Route path="/retail/*" element={<App />} />
      <Route path="/ev-chargers/*" element={<EVChargersApp />} />
      <Route path="/" element={<Navigate to="/retail/" replace />} />
      <Route path="*" element={<Navigate to="/retail/" replace />} />
    </Routes>
  );
}
