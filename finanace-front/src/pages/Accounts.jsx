import React, { useState, useEffect } from "react";
import { Plus, Eye, Trash2, Wallet, Banknote, PiggyBank, CreditCard } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(null);
  const [selected, setSelected] = useState(null);

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts/");
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setAccounts(data);
      } catch (err) {
        setError("Failed to fetch accounts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  // Delete account
  const handleDelete = async (id) => {
    try {
      await api.delete(`/accounts/${id}/`);
      setAccounts(accounts.filter((acc) => acc.id !== id));
      toast.success("Account deleted");
    } catch (err) {
      toast.error("Failed to delete account");
      console.error(err);
    }
  };

  // Add account
  const handleAdd = async (e) => {
    e.preventDefault();
    const newAcc = {
      name: e.target.name.value,
      balance: Number(e.target.balance.value),
      type: e.target.type.value,
      currency: e.target.currency.value,
    };
    try {
      const res = await api.post("/accounts/", newAcc);
      setAccounts([...accounts, res.data]);
      toast.success("Account added successfully");
      setOpenModal(null);
    } catch (err) {
      toast.error("Failed to add account");
      console.error(err);
    }
  };

  // Icons per type
  const typeIcon = (type) => {
    switch (type) {
      case "Bank":
        return <Banknote className="h-6 w-6 text-blue-600" />;
      case "Savings":
        return <PiggyBank className="h-6 w-6 text-green-600" />;
      case "Credit Card":
        return <CreditCard className="h-6 w-6 text-purple-600" />;
      default:
        return <Wallet className="h-6 w-6 text-gray-600" />;
    }
  };

  // UI states
  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-gray-500">Manage your financial accounts and track balances</p>
        </div>
        <button
          onClick={() => {
            setSelected(null);
            setOpenModal("add");
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 shadow-md"
        >
          <Plus size={18} /> Add Account
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500">Total Accounts</p>
          <h2 className="text-2xl font-bold">{accounts.length}</h2>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500">Net Worth</p>
          <h2 className="text-2xl font-bold">
            ${isNaN(accounts.reduce((acc, a) => acc + (parseFloat(a.balance) || 0), 0)) 
              ? 0 
              : accounts.reduce((acc, a) => acc + (parseFloat(a.balance) || 0), 0).toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Account Cards */}
      {accounts.length === 0 ? (
        <p className="text-gray-500">No accounts found. Add one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl transition border-t-4 border-indigo-500"
            >
              <div className="flex items-center gap-3 mb-3">
                {typeIcon(acc.type)}
                <h3 className="text-lg font-semibold">{acc.name}</h3>
              </div>
              <div className="flex-1">
                <p
                  className={`font-bold text-2xl ${
                    acc.balance < 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  ${acc.balance.toLocaleString()}
                </p>
                <p className="text-gray-500">
                  {acc.type} | {acc.currency}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Last Updated: {new Date(acc.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelected(acc);
                    setOpenModal("view");
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenModal(null)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-fadeIn">
            <button
              onClick={() => setOpenModal(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {/* View account */}
            {openModal === "view" && selected && (
              <div>
                <h2 className="text-xl font-bold mb-4">{selected.name}</h2>
                <p className="mb-2">
                  <b>Balance:</b> ${selected.balance.toLocaleString()}
                </p>
                <p className="mb-2">
                  <b>Type:</b> {selected.type}
                </p>
                <p className="mb-2">
                  <b>Currency:</b> {selected.currency}
                </p>
                <p className="text-gray-500 text-sm">
                  <b>Last Updated:</b> {new Date(selected.updated_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Add account */}
            {openModal === "add" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Add Account</h2>
                <form onSubmit={handleAdd} className="flex flex-col gap-3">
                  <input
                    name="name"
                    placeholder="Account Name"
                    required
                    className="border px-3 py-2 rounded-lg focus:ring"
                  />
                  <input
                    name="balance"
                    type="number"
                    placeholder="Balance"
                    defaultValue={0}
                    className="border px-3 py-2 rounded-lg focus:ring"
                  />
                  <select name="type" className="border px-3 py-2 rounded-lg focus:ring" required>
                    <option value="Bank">Bank</option>
                    <option value="Savings">Savings</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Loan">Loan</option>
                    <option value="Investment">Investment</option>
                    <option value="Cash">Cash</option>
                  </select>
                  <input
                    name="currency"
                    placeholder="Currency"
                    defaultValue="USD"
                    required
                    className="border px-3 py-2 rounded-lg focus:ring"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white py-2 rounded-lg mt-2 hover:bg-indigo-700 transition shadow-md"
                  >
                    Add Account
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
