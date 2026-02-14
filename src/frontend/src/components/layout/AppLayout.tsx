import { Outlet, useLocation } from '@tanstack/react-router';
import ResponsiveNav from './ResponsiveNav';

export default function AppLayout() {
  const location = useLocation();
  const isStartPage = location.pathname === '/';

  if (isStartPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveNav />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>
      <footer className="border-t mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Mobile Receipt. Built with ❤️ using{' '}
          <a 
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
