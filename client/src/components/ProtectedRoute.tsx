import { Navigate } from "react-router";
import { type ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected component
  return <>{children}</>;
}
