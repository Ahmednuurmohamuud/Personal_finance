// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, BarChart2, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 lg:px-20 py-20 flex flex-col-reverse lg:flex-row items-center gap-10">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            FinanceTracker
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Personal Finance Manager <br /> by Heegan Technology
          </p>
          <p className="text-gray-600 mb-6">
            Take Control of Your Finances. Track expenses, manage budgets, and grow your wealth with our intuitive financial dashboard. Your personal financial coach that makes money management simple and empowering.
          </p>
         <div className="flex gap-4 flex-wrap">
  <Link
    to="/login"
    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
  >
    Sign In <ArrowRight size={18} />
  </Link>

  <Link
    to="/register"
    className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition"
  >
    Get Started
  </Link>
</div>

        </div>
        <div className="flex-1">
          <img
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/finance/hero.png"
            alt="Finance Dashboard"
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 lg:px-20 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose FinanceTracker?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
            <BarChart2 size={36} className="text-indigo-600"/>
            <h3 className="font-semibold text-lg">Smart Analytics</h3>
            <p className="text-gray-600">Visualize spending patterns and track your financial progress</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
            <ShieldCheck size={36} className="text-indigo-600"/>
            <h3 className="font-semibold text-lg">Secure & Private</h3>
            <p className="text-gray-600">Bank-level security to keep your financial data protected</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
            <Smartphone size={36} className="text-indigo-600"/>
            <h3 className="font-semibold text-lg">Mobile Ready</h3>
            <p className="text-gray-600">Access your finances anywhere with responsive design</p>
          </div>
          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center gap-4">
            <ArrowRight size={36} className="text-indigo-600"/>
            <h3 className="font-semibold text-lg">Trusted by Users</h3>
            <p className="text-gray-600">Thousands of users rely on FinanceTracker for their personal finances</p>
          </div>
        </div>
      </section>
    </div>
  );
}
