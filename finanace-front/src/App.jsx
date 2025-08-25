import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import PrivateRoute from "./components/PrivateRoute"; // Protected route
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Home from "./pages/Home";  


import Budgets from "./pages/Budgets";  
import Bills from "./pages/Bills";
import Reports from "./pages/Reports"; 
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";   
// import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/notification";

import './index.css'; // Tailwind CSS
import './App.css';   // Custom styles

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow p-4 bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* <Route path="/profile" element={<Profile />} /> */}

              <Route
                path="/transactions"
                element={
                  <PrivateRoute>
                    <Transactions />
                  </PrivateRoute>
                }
              />

              <Route
                path="/accounts"
                element={
                  <PrivateRoute>
                    <Accounts />
                  </PrivateRoute>
                }
              />

              <Route
                path="/budgets"
                element={
                  <PrivateRoute>
                    <Budgets />
                  </PrivateRoute>
                }
              />

              <Route
                path="/recurring"
                element={
                  <PrivateRoute>
                    <Bills />
                  </PrivateRoute>
                }
              />

              {/* Redirect /recurring to /bills */}
              {/* <Route path="/recurring" element={<Navigate to="/bills" replace />} /> */}
                   <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
              {/* <Route path="/reports" element={<Reports />} /> */}
                
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
