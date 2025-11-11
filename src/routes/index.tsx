import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";
import { HomePage } from "../pages/HomePage";

import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

import { AssetsPage } from "../pages/AssetsPage";
import { AssetDetailPage } from "../pages/AssetDetailPage";
import { LiabilitiesPage } from "../pages/LiabilitiesPage";
import { LiabilityDetailPage } from "../pages/LiabilityDetailPage";
import { CustomCategoriesPage } from "../pages/CustomCategoriesPage";
import { SettingsPage } from "../pages/SettingsPage";
import { Box, CircularProgress } from "@mui/material";

// Auth routes - redirect to dashboard if already authenticated
const authRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];

// Protected routes - require authentication
const protectedRoutes = [
  { path: "/dashboard", element: <HomePage /> },
  { path: "/assets", element: <AssetsPage /> },
  { path: "/assets/:id", element: <AssetDetailPage /> },
  { path: "/liabilities", element: <LiabilitiesPage /> },
  { path: "/liabilities/:id", element: <LiabilityDetailPage /> },
  { path: "/custom-categories", element: <CustomCategoriesPage /> },
  { path: "/settings", element: <SettingsPage /> },
];

export const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* Auth routes - redirect to dashboard if already authenticated */}
        {authRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : route.element}
          />
        ))}
        
        {/* Protected routes - require authentication */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}>
          {protectedRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>
      </Routes>
    </Router>
  );
};
