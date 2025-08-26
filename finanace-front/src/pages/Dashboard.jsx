import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../services/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3B82F6", "#22C55E", "#FACC15", "#F97316", "#A855F7", "#EF4444"];


export default function Dashboard() {
  const { user } = useContext(AuthContext); // hel user
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
 const [showToast, setShowToast] = useState(true);


  // Toast welcome once, 3 seconds duration
  useEffect(() => {
    if (user && showToast) {
      toast.success(`Welcome back, ${user.username}!`, {
        duration: 2000, // 3 seconds
        position: "top-right",
      });
      setShowToast(false);
    }
  }, [user, showToast]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, accRes, catRes, budgetRes] = await Promise.all([
          api.get("/transactions/"),
          api.get("/accounts/"),
          api.get("/categories/"),
          api.get("/budgets/"),
        ]);

        setTransactions(txRes.data.results);
        setAccounts(accRes.data.results);
        setCategories(catRes.data.results);
        setBudgets(budgetRes.data.results);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Maps for easy lookup
  const accountMap = accounts.reduce((acc, a) => {
    acc[a.id] = a.name;
    return acc;
  }, {});

  const categoryMap = categories.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {});

  // Prepare chart data
  const incomeExpensesData = [];
  const spendingCategoriesData = [];
  const categoryTotals = {};

  transactions.forEach((tx) => {
    const month = new Date(tx.transaction_date).toLocaleString("default", { month: "short" });
    let monthObj = incomeExpensesData.find((d) => d.month === month);
    if (!monthObj) {
      monthObj = { month, income: 0, expenses: 0 };
      incomeExpensesData.push(monthObj);
    }
    if (tx.type === "Income") monthObj.income += parseFloat(tx.amount);
    if (tx.type === "Expense") monthObj.expenses += parseFloat(tx.amount);

    if (tx.type === "Expense" && tx.category) {
      const name = categoryMap[tx.category] || "Unknown";
      if (!categoryTotals[name]) categoryTotals[name] = 0;
      categoryTotals[name] += parseFloat(tx.amount);
    }
  });

  for (const [name, value] of Object.entries(categoryTotals)) {
    spendingCategoriesData.push({ name, value });
  }

  if (loading) return <p className="p-4">Loading dashboard data...</p>;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
       <Toaster />


      {/* Top Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incomeExpensesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Account Balances */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Account Balances</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={accounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="balance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-3 rounded-lg border flex justify-between bg-gray-50">
                <span className="text-gray-600">{acc.name}</span>
                <span className="font-bold text-gray-800">${parseFloat(acc.balance).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending Categories */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Spending Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingCategoriesData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {spendingCategoriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Budget Overview</h2>
          <div className="space-y-4">
            {budgets.map((b) => {
              const percent = Math.round((b.used_amount / b.amount) * 100) || 0;
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{b.category?.name || "Unknown"}</span>
                    <span className="font-medium text-gray-800">
                      {b.used_amount || 0} / {b.amount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Remaining ${b.amount - (b.used_amount || 0)}
                  </p>
                </div>
              );
            })}
          </div>
          <button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
            Manage Budgets
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Recent Transactions</h2>
          <button className="text-blue-600 hover:underline">View All</button>
        </div>
        <div className="divide-y">
          {transactions.slice(0, 10).map((t, i) => (
            <div
              key={i}
              className="flex justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition"
            >
              <div>
                <p className="font-medium text-gray-800">{t.description || "No description"}</p>
                <p className="text-sm text-gray-500">
                  {categoryMap[t.category] || "No Category"} • {accountMap[t.account] || "Unknown Account"}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${
                    parseFloat(t.amount) > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {parseFloat(t.amount) > 0 ? "+" : ""}
                  {parseFloat(t.amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">{t.transaction_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
