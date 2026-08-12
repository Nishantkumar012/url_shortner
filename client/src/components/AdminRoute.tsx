import { Navigate } from "react-router";
import { type ReactNode } from "react";
import { isAdminLoggedIn } from "../utils/adminAuth";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  // No admin token → send to the admin login page.
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  // Has an admin token → render the protected admin screen.
  return <>{children}</>;
}
