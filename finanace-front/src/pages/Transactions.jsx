// src/pages/Transactions.jsx
import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit2, Trash2, Download, RefreshCcw } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const typeMap = {
  Income: "Income",
  Expense: "Expense",
  Transfer: "Transfer",
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(null); // "view" | "edit" | "add"
  const [selected, setSelected] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [filter, setFilter] = useState({
    account: "All",
    category: "All",
    type: "All",
    startDate: "",
    endDate: "",
  });
  const [formType, setFormType] = useState("Expense");

  // Helper functions
  const getAccountName = (id) => accounts.find((a) => a.id === id)?.name || "—";
  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "—";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [txRes, accRes, catRes, curRes] = await Promise.all([
          api.get("/transactions/"),
          api.get("/accounts/"),
          api.get("/categories/"),
          api.get("/currencies/"),
        ]);

        setTransactions(Array.isArray(txRes.data) ? txRes.data : txRes.data.results || []);
        setAccounts(Array.isArray(accRes.data) ? accRes.data : accRes.data.results || []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
        setCurrencies(Array.isArray(curRes.data) ? curRes.data : curRes.data.results || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data from API");
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter transactions
  const filtered = (transactions || []).filter((t) => {
    const accountId = t.account?.id || t.account;
    const categoryId = t.category?.id || t.category;

    const matchAccount = filter.account === "All" || accountId?.toString() === filter.account;
    const matchCategory = filter.category === "All" || categoryId?.toString() === filter.category;
    const matchType = filter.type === "All" || t.type === filter.type;
    const matchStart = !filter.startDate || new Date(t.transaction_date) >= new Date(filter.startDate);
    const matchEnd = !filter.endDate || new Date(t.transaction_date) <= new Date(filter.endDate);

    return matchAccount && matchCategory && matchType && matchStart && matchEnd;
  });

  // Delete transaction
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/transactions/${id}/`);
      setTransactions(transactions.filter((t) => t.id !== id));
      toast.success("Transaction deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transaction");
    }
  };

  // Add/Edit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      account: form.account.value || undefined,
      target_account: formType === "Transfer" ? form.target_account.value || undefined : undefined,
      category: formType !== "Transfer" ? form.category?.value || null : null,
      type: typeMap[formType] || "Expense",
      amount: Number(form.amount.value) || undefined,
      currency: form.currency.value || "USD",
      description: form.description.value || "",
      transaction_date: form.date.value || undefined,
    };

    try {
      let res;
      if (openModal === "add") {
        res = await api.post("/transactions/", data);
        setTransactions([...transactions, res.data]);
        toast.success("Transaction added");
      } else if (openModal === "edit" && selected) {
        res = await api.put(`/transactions/${selected.id}/`, data);
        setTransactions(transactions.map((t) => (t.id === selected.id ? res.data : t)));
        toast.success("Transaction updated");
      }
      setOpenModal(null);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error("Transaction failed");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = [
      ["Date", "Description", "Category", "Account", "Amount", "Type", "Currency"],
      ...filtered.map((t) => [
        t.transaction_date,
        t.description,
        t.category?.name || getCategoryName(t.category),
        t.account?.name || getAccountName(t.account),
        t.amount,
        t.type,
        t.currency?.code || "USD",
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  const openForm = (type, tx = null) => {
    setSelected(tx);
    setFormType(tx?.type || "Expense");
    setOpenModal(type);
  };

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between flex-wrap mb-4 gap-2">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          onClick={() => openForm("add")}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        <select
          value={filter.account}
          onChange={(e) => setFilter({ ...filter, account: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.type})
            </option>
          ))}
        </select>

        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
          <option value="Transfer">Transfer</option>
        </select>

        <input
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={() =>
            setFilter({ account: "All", category: "All", type: "All", startDate: "", endDate: "" })
          }
          className="bg-gray-200 px-3 py-2 rounded flex items-center gap-1 hover:bg-gray-300 transition"
        >
          <RefreshCcw size={16} /> Clear
        </button>

        <button
          onClick={handleExportCSV}
          className="bg-green-100 px-3 py-2 rounded flex items-center gap-1 hover:bg-green-200 transition"
        >
          <Download size={16} /> CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg text-left">
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-3 py-2">{t.transaction_date}</td>
                <td className="px-3 py-2">{t.description || "—"}</td>
                <td className="px-3 py-2">{t.category?.name || getCategoryName(t.category)}</td>
                <td className="px-3 py-2">{t.account?.name || getAccountName(t.account)}</td>
                <td
                  className={`px-3 py-2 font-medium ${
                    t.amount < 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {t.amount?.toLocaleString() || 0}
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={() => openForm("view", t)} className="text-blue-500 hover:text-blue-700">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => openForm("edit", t)} className="text-green-500 hover:text-green-700">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenModal(null)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative z-10 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setOpenModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">✕</button>

            {(openModal === "add" || openModal === "edit") && (
              <div>
                <h2 className="text-xl font-bold mb-4">{openModal === "add" ? "Add Transaction" : "Edit Transaction"}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input name="date" type="date" defaultValue={selected?.transaction_date} className="border px-3 py-2 rounded" required />
                  <input name="description" placeholder="Description" defaultValue={selected?.description} className="border px-3 py-2 rounded" />
                  <select
                    name="account"
                    defaultValue={selected?.account?.id || selected?.account || ""}
                    required
                    className="border px-3 py-2 rounded w-full"
                  >
                    <option value="">Select Account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>

                  <input name="amount" type="number" defaultValue={selected?.amount || ""} className="border px-3 py-2 rounded" required />

                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="border px-3 py-2 rounded"
                    required
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                    <option value="Transfer">Transfer</option>
                  </select>

                  {formType === "Transfer" && (
                    <select name="target_account" defaultValue={selected?.target_account?.id || ""} className="border px-3 py-2 rounded" required>
                      <option value="">Select Target Account</option>
                      {accounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
                    </select>
                  )}

                  {formType !== "Transfer" && (
                    <select name="category" defaultValue={selected?.category?.id || selected?.category || ""} className="border px-3 py-2 rounded w-full">
                      <option value="">No Category</option>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  )}

                  <select name="currency" defaultValue={selected?.currency?.code || "USD"} className="border px-3 py-2 rounded" required>
                    {currencies.map((c) => (<option key={c.code} value={c.code}>{c.code}</option>))}
                  </select>

                  <button type="submit" className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                    {openModal === "add" ? "Add" : "Save"} Transaction
                  </button>
                </form>
              </div>
            )}

            {openModal === "view" && selected && (
              <div>
                <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
                <p><b>Date:</b> {selected.transaction_date}</p>
                <p><b>Description:</b> {selected.description || "—"}</p>
                <p><b>Category:</b> {selected.category?.name || "—"}</p>
                <p><b>Account:</b> {selected.account?.name || "—"}</p>
                <p><b>Amount:</b> {selected.amount}</p>
                <p><b>Type:</b> {selected.type}</p>
                <p><b>Currency:</b> {selected.currency?.code || "USD"}</p>
                {selected.type === "Transfer" && <p><b>Target Account:</b> {selected.target_account?.name || "—"}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
