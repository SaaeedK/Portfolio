/** Catch-all route for unknown paths. */
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { focusRing } from '@/lib/a11y';

export const NotFound = () => {
  useDocumentTitle('Page not found');

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tighter">404</h1>
      <p className="font-mono text-sm text-on-surface-variant">
        No route matches this path. The terminal only serves dashboard, labs, logs, and comms.
      </p>
      <Link to="/" className={`terminal-button w-fit inline-flex ${focusRing}`}>
        Return to dashboard
      </Link>
    </div>
  );
};
