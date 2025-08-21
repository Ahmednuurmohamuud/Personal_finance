import React, { useState, useEffect } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
// ensure this points to your api.ts
import api from "../services/api";


export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(null); // "view" | "add"
  const [selected, setSelected] = useState(null);

  // Fetch accounts from backend
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts/");
        setAccounts(res.data);
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
      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (err) {
      alert("Failed to delete account");
      console.error(err);
    }
  };

  // Add new account
  const handleAdd = async (e) => {
    e.preventDefault();
    const newAcc = {
      name: e.target.name.value,
      balance: Number(e.target.balance.value),
      type: e.target.type.value,
      currency: e.target.currency.value,
      lastUpdated: e.target.date.value,
    };
    try {
      const res = await api.post("/accounts/", newAcc);
      setAccounts([...accounts, res.data]);
      setOpenModal(null);
    } catch (err) {
      alert("Failed to add account");
      console.error(err);
    }
  };

  if (loading) return <p>Loading accounts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-gray-500">Manage your financial accounts and track balances</p>
        </div>
        <button
          onClick={() => { setSelected(null); setOpenModal("add"); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16}/> Add Account
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500">Total Accounts</p>
          <h2 className="text-xl font-bold">{accounts.length}</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500">Net Worth</p>
          <h2 className="text-xl font-bold">
            ${accounts.reduce((a,b)=>a+b.balance,0).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between hover:shadow-lg transition">
            <div>
              <h3 className="text-lg font-semibold">{acc.name}</h3>
              <p className={`font-bold text-xl ${acc.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                ${acc.balance.toLocaleString()}
              </p>
              <p className="text-gray-500">{acc.type} | {acc.currency}</p>
              <p className="text-gray-400 text-sm">Last Updated: {acc.lastUpdated}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setSelected(acc); setOpenModal("view"); }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
              >
                <Eye size={16}/> View
              </button>
              <button
                onClick={() => handleDelete(acc.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
              >
                <Trash2 size={16}/> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setOpenModal(null)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 transition-transform duration-300 transform scale-100">
            <button
              onClick={() => setOpenModal(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {openModal === "view" && selected && (
              <div>
                <h2 className="text-xl font-bold mb-4">{selected.name}</h2>
                <p><b>Balance:</b> ${selected.balance.toLocaleString()}</p>
                <p><b>Type:</b> {selected.type}</p>
                <p><b>Currency:</b> {selected.currency}</p>
                <p><b>Last Updated:</b> {selected.lastUpdated}</p>
              </div>
            )}

            {openModal === "add" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Add Account</h2>
                <form onSubmit={handleAdd} className="flex flex-col gap-3">
                  <input name="name" placeholder="Account Name" className="border px-3 py-2 rounded"/>
                  <input name="balance" type="number" placeholder="Balance" className="border px-3 py-2 rounded"/>
                  <select name="type" className="border px-3 py-2 rounded">
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Loan">Loan</option>
                    <option value="Investment">Investment</option>
                  </select>
                  <input name="currency" placeholder="Currency" defaultValue="USD" className="border px-3 py-2 rounded"/>
                  <input name="date" type="date" className="border px-3 py-2 rounded"/>
                  <button type="submit" className="bg-indigo-600 text-white py-2 rounded-lg mt-2 hover:bg-indigo-700 transition">Add Account</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
