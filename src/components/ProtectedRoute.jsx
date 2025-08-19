import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { get } from "@/utils/api";

export default function ProtectedRoute() {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        setIsValidating(false);
        setIsValid(false);
        return;
      }

      try {
        // Validate token with backend
        await get('/admin/validate');
        setIsValid(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('auth_token');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}