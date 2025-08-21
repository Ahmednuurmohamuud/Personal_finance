import React from "react";
import { Link } from "react-router-dom";
import { Bell, Search, User, Settings, Archive, LogOut } from "lucide-react";


function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);

  return (
    <header className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-200 bg-white relative">
      {/* Logo */}
      <div className="logo font-bold text-lg text-indigo-600">
        <Link to="/dashboard">💰 Finance Manager</Link>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden sm:flex items-center gap-8">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/accounts">Accounts</Link>
        <Link to="/budgets">Budgets</Link>
        <Link to="/recurring">Bills</Link>
        <Link to="/reports">Reports</Link>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            type="text"
            placeholder="Search..."
          />
          <Search size={16} className="text-gray-500" />
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-700" />
          <span className="absolute -top-2 -right-2 text-xs text-white bg-indigo-500 w-[18px] h-[18px] flex items-center justify-center rounded-full">
            3
          </span>
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setAccountOpen(!accountOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
          >
            <User className="w-6 h-6" />
          </button>

          {accountOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border p-2 z-50">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <User className="w-4 h-4" /> Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <Link
                to="/archive"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <Archive className="w-4 h-4" /> Archive Items
              </Link>
              <button
                onClick={() => alert("Logging out...")}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-red-100 text-red-600"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
        className="sm:hidden"
      >
        <svg
          width="21"
          height="15"
          viewBox="0 0 21 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="21" height="1.5" rx=".75" fill="#426287" />
          <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
          <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
        </svg>
      </button>

      {/* Mobile Menu */}
      <div
        className={`${
          mobileOpen ? "flex" : "hidden"
        } absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-3 px-5 text-sm sm:hidden z-40`}
      >
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/accounts">Accounts</Link>
        <Link to="/budgets">Budgets</Link>
        <Link to="/recurring">Recurring Bills</Link>
        <Link to="/reports">Reports</Link>

        {/* Search (mobile) */}
        <div className="flex items-center w-full border border-gray-300 px-3 rounded-full mt-3">
          <input
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 text-sm"
            type="text"
            placeholder="Search..."
          />
          <Search size={16} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
