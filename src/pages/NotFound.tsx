import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="mb-4 font-display text-6xl font-bold text-primary">404</h1>
        <p className="mb-2 font-sans text-2xl font-semibold text-foreground">Oops! Page not found</p>
        <p className="mb-8 font-sans text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg" className="rounded-full">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
