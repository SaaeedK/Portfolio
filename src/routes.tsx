import { Route, Routes } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Labs } from '@/pages/Labs';
import { Logs } from '@/pages/Logs';
import { Comms } from '@/pages/Comms';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/labs" element={<Labs />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/comms" element={<Comms />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
