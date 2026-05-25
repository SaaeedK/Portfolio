/**
 * Route table — each page is code-split via React.lazy.
 * Unknown paths render NotFound without exposing internal routes.
 */
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteFallback } from '@/layout/RouteFallback';

const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Labs = lazy(() => import('@/pages/Labs').then((m) => ({ default: m.Labs })));
const Logs = lazy(() => import('@/pages/Logs').then((m) => ({ default: m.Logs })));
const Comms = lazy(() => import('@/pages/Comms').then((m) => ({ default: m.Comms })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/comms" element={<Comms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
