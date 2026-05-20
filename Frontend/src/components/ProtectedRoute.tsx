// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";

const isDev = window.location.hostname === "localhost";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();

  if (isDev) return children;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}