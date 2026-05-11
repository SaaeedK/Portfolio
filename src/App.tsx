/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { Shell } from '@/layout';
import { AppRoutes } from '@/routes';

export default function App() {
  return (
    <Router>
      <Shell>
        <AppRoutes />
      </Shell>
    </Router>
  );
}
