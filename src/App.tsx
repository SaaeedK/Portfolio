/** Application shell: client router, layout chrome, and lazy-loaded route modules. */
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
