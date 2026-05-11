/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Home } from './pages/Home';
import { Labs } from './pages/Labs';
import { Logs } from './pages/Logs';
import { Comms } from './pages/Comms';

export default function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/comms" element={<Comms />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Shell>
    </Router>
  );
}
