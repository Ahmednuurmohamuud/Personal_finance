import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import api from "../services/api";
import { DollarSign, CreditCard, BarChart2 } from "lucide-react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(null); // "add" | "edit"
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetRes, catRes, curRes] = await Promise.all([
          api.get("/budgets/"),
          api.get("/categories/"),
          api.get("/currencies/"),
        ]);
        setBudgets(
          Array.isArray(budgetRes.data)
            ? budgetRes.data
            : budgetRes.data.results
        );
        setCategories(
          Array.isArray(catRes.data) ? catRes.data : catRes.data.results
        );
        setCurrencies(
          Array.isArray(curRes.data) ? curRes.data : curRes.data.results
        );
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data from API");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Delete Budget
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/budgets/${id}/`);
      setBudgets(budgets.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete budget");
    }
  };
// Xisaabi totals
const totalBudgeted = budgets.reduce((acc, b) => acc + parseFloat(b.amount), 0);
const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
const remaining = totalBudgeted - totalSpent;
  // Add / Edit Budget
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
   const data = {
      category: form.category.value,
      amount: form.amount.value || "0.00",
      month: Number(form.month.value),
      year: Number(form.year.value),
      currency: form.currency.value,
      rollover_enabled: form.rollover_enabled.checked,
    };


    if (!data.category || !data.amount || !data.currency || !data.month || !data.year) {
      alert("Fadlan buuxi dhammaan meelaha loo baahan yahay");
      return;
    }

    try {
      if (openModal === "add") {
        const res = await api.post("/budgets/", data);
        setBudgets([...budgets, res.data]);
      } else if (openModal === "edit" && selected) {
        const res = await api.put(`/budgets/${selected.id}/`, data);
        setBudgets(budgets.map((b) => (b.id === selected.id ? res.data : b)));
      }
      setOpenModal(null);
      setSelected(null);
    } catch (err) {
      console.error(err.response?.data || err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
        alert("Failed to save budget:\n" + messages);
      } else {
        alert("Failed to save budget");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <button
          onClick={() => {
            setSelected(null);
            setOpenModal("add");
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Budget
        </button>
      </div>
     {/* Budget Summary */}
<div className="mb-6 grid grid-cols-3 gap-4">
  <div className="bg-gray-100 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2">
    <DollarSign size={32} className="text-indigo-600" />
    <p className="text-gray-500">Total Budgeted</p>
    <p className="text-xl font-bold">${totalBudgeted.toFixed(2)}</p>
  </div>
  <div className="bg-gray-100 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2">
    <CreditCard size={32} className="text-red-500" />
    <p className="text-gray-500">Total Spent</p>
    <p className="text-xl font-bold">${totalSpent.toFixed(2)}</p>
  </div>
  <div className="bg-gray-100 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2">
    <BarChart2 size={32} className="text-green-500" />
    <p className="text-gray-500">Remaining</p>
    <p className="text-xl font-bold">${remaining.toFixed(2)}</p>
  </div>
</div>


      {/* Budget Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Month/Year</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Rollover</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
  {budgets.map((b) => {
    const spent = b.spent || 0;
    const categoryName = categories.find((c) => c.id === b.category)?.name || "—";

    return (
      <tr key={b.id} className="border-t hover:bg-gray-50">
        <td className="px-3 py-2">{categoryName}</td>
        <td className="px-3 py-2">
          {new Date(b.year, b.month - 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </td>
        <td className="px-3 py-2">
          {spent.toFixed(2)} of {parseFloat(b.amount).toFixed(2)}
        </td>
        <td className="px-3 py-2">{b.rollover_enabled ? "Yes" : "No"}</td>
        <td className="px-3 py-2 flex justify-center gap-2">
          <button
            onClick={() => {
              setSelected(b);
              setOpenModal("edit");
            }}
            className="text-green-500 hover:text-green-700"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(b.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  })}
  {budgets.length === 0 && (
    <tr>
      <td colSpan={5} className="text-center py-6 text-gray-500">
        No budgets found
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {/* Modal Add/Edit */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setOpenModal(null);
              setSelected(null);
            }}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative z-10 animate-slide-in">
            <button
              onClick={() => {
                setOpenModal(null);
                setSelected(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {openModal === "add" ? "Add Budget" : "Edit Budget"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
               <select
      name="category"
      defaultValue={selected?.category?.id || ""}
      className="border px-3 py-2 rounded"
      required
    >
      <option value="">Select Category</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>

              <div className="flex gap-2">
                <select
                  name="month"
                  defaultValue={selected?.month || new Date().getMonth() + 1}
                  className="border px-3 py-2 rounded flex-1"
                  required
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="year"
                  defaultValue={selected?.year || new Date().getFullYear()}
                  className="border px-3 py-2 rounded flex-1"
                  required
                />
              </div>

              <input
                type="number"
                name="amount"
                placeholder="Amount"
                defaultValue={selected?.amount || ""}
                className="border px-3 py-2 rounded"
                required
              />

              <select
                name="currency"
                defaultValue={selected?.currency || "USD"}
                className="border px-3 py-2 rounded"
                required
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rollover_enabled"
                  defaultChecked={selected?.rollover_enabled || false}
                />
                Enable Rollover
              </label>

              <button
                type="submit"
                className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                {openModal === "add" ? "Add" : "Save"} Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
