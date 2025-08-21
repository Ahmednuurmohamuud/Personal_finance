import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Home from "./pages/home";  
// import Budgets from "./pages/Budgets";
// import Bills from "./pages/Bills";
// import Reports from "./pages/Reports"; 
// import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";   
// import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import './index.css'; // Assuming you have Tailwind CSS set up
import './App.css'; // Custom styles if any







function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
      
        <main className="flex-grow p-4 bg-gray-50">
            <Navbar />
          <Routes>
          <Route path="/" element={<Home/>} />  {/* Default homepage */}
           {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* <Route path="/profile" element={<Profile />} /> */}
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            {/* <Route path="/budgets" element={<Budgets />} /> */}
            {/* <Route path="/bills" element={<Bills />} /> */}
            {/* <Route path="/reports" element={<Reports />} />  */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
