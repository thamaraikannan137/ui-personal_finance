import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";
import { HomePage } from "../pages/HomePage";

import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

import { SettingsPage } from "../pages/SettingsPage";
import { Box, CircularProgress } from "@mui/material";

// Net Worth Certificate pages
import { ClientListPage } from "../pages/ClientListPage";
import { ClientFormPage } from "../pages/ClientFormPage";
import { ClientDetailPage } from "../pages/ClientDetailPage";
import { CertificateOverviewPage } from "../pages/CertificateOverviewPage";
import { Annexure1Page } from "../pages/Annexure1Page";
import { Annexure2Page } from "../pages/Annexure2Page";
import { CertificateLiabilityPage } from "../pages/CertificateLiabilityPage";
import { GuarantorsPage } from "../pages/GuarantorsPage";
import { SummaryPage } from "../pages/SummaryPage";

// Auth routes - redirect to dashboard if already authenticated
const authRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
];

// Protected routes - require authentication
const protectedRoutes = [
  { path: "/dashboard", element: <HomePage /> },
  { path: "/settings", element: <SettingsPage /> },
  // Net Worth Certificate routes
  { path: "/clients", element: <ClientListPage /> },
  { path: "/clients/new", element: <ClientFormPage /> },
  { path: "/clients/:id", element: <ClientDetailPage /> },
  { path: "/clients/:id/edit", element: <ClientFormPage /> },
  { path: "/certificates/:id", element: <CertificateOverviewPage /> },
  { path: "/certificates/:id/annexure1", element: <Annexure1Page /> },
  { path: "/certificates/:id/annexure2", element: <Annexure2Page /> },
  { path: "/certificates/:id/liabilities", element: <CertificateLiabilityPage /> },
  { path: "/certificates/:id/guarantors", element: <GuarantorsPage /> },
  { path: "/certificates/:id/summary", element: <SummaryPage /> },
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
