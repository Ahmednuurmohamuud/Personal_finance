import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit2, Trash2, Download, RefreshCcw } from "lucide-react";
import api from "../services/api";

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
  const [splits, setSplits] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, accRes, catRes, curRes] = await Promise.all([
          api.get("/transactions/"),
          api.get("/accounts/"),
          api.get("/categories/"),
          api.get("/currencies/"),
        ]);
        setTransactions(Array.isArray(txRes.data) ? txRes.data : txRes.data.results);
        setAccounts(Array.isArray(accRes.data) ? accRes.data : accRes.data.results);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results);
        setCurrencies(Array.isArray(curRes.data) ? curRes.data : curRes.data.results);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data from API");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mapping for easy name lookup
const accountMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));
const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));


  const filtered = transactions.filter((t) => {
    const matchAccount = filter.account === "All" || t.account?.id === filter.account;
    const matchCategory = filter.category === "All" || t.category?.id === filter.category;
    const matchType = filter.type === "All" || t.type === filter.type;
    const matchStart = !filter.startDate || new Date(t.transaction_date) >= new Date(filter.startDate);
    const matchEnd = !filter.endDate || new Date(t.transaction_date) <= new Date(filter.endDate);
    return matchAccount && matchCategory && matchType && matchStart && matchEnd;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/transactions/${id}/`);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction");
    }
  };

  const handleSplitChange = (index, key, value) => {
    const newSplits = [...splits];
    newSplits[index][key] = key === "amount" ? Number(value) : value;
    setSplits(newSplits);
  };

  const addSplit = () => setSplits([...splits, { category: "", amount: 0 }]);
  const removeSplit = (index) => setSplits(splits.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      account: form.account.value || undefined,
      target_account: formType === "Transfer" ? form.target_account.value : undefined,
      category: formType !== "Transfer" ? form.category?.value : undefined,
      type: formType,
      amount: Number(form.amount.value) || undefined,
      currency: form.currency.value,
      description: form.description.value || "",
      transaction_date: form.date.value || undefined,
      splits: splits.filter(s => s.category && s.amount > 0),
    };

    const missingFields = [];
    if (!form.account.value) missingFields.push("Account");
    if (!formType) missingFields.push("Type");
    if (!form.amount.value) missingFields.push("Amount");
    if (!form.currency.value) missingFields.push("Currency");
    if (!form.date.value) missingFields.push("Date");
    if (formType === "Transfer" && !form.target_account?.value) missingFields.push("Target Account");

    if (missingFields.length > 0) {
      alert("Fadlan buuxi meelaha soo socda: " + missingFields.join(", "));
      return;
    }

    try {
      let res;
      if (openModal === "add") {
        res = await api.post("/transactions/", data);
        setTransactions([...transactions, res.data]);
      } else if (openModal === "edit" && selected) {
        res = await api.put(`/transactions/${selected.id}/`, data);
        setTransactions(transactions.map((t) => (t.id === selected.id ? res.data : t)));
      }
      setOpenModal(null);
      setSplits([]);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Ku guuldareystay transaction: " + JSON.stringify(err.response?.data));
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Date","Description","Category","Account","Amount","Type","Currency"],
      ...filtered.map((t) => [
        t.transaction_date,
        t.description,
        t.category?.name || "",
        t.account?.name || "",
        t.amount,
        t.type,
        t.currency?.code,
      ]),
    ].map(e => e.join(",")).join("\n");

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
    setSplits(tx?.splits || []);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={() => openForm("add")} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select value={filter.account} onChange={(e) => setFilter({ ...filter, account: e.target.value })} className="border px-3 py-2 rounded">
          <option value="All">All Accounts</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="border px-3 py-2 rounded">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="border px-3 py-2 rounded">
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
          <option value="Transfer">Transfer</option>
        </select>

        <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} className="border px-3 py-2 rounded" />
        <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} className="border px-3 py-2 rounded" />

        <button onClick={() => setFilter({ account:"All", category:"All", type:"All", startDate:"", endDate:"" })} className="bg-gray-200 px-3 py-2 rounded flex items-center gap-1">
          <RefreshCcw size={16} /> Clear
        </button>
        <button onClick={handleExportCSV} className="bg-green-100 px-3 py-2 rounded flex items-center gap-1">
          <Download size={16} /> CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{t.transaction_date}</td>
                <td className="px-3 py-2">{t.description}</td>
               <td className="px-3 py-2">
                  {t.category
                    ? categories.find((c) => c.id === (t.category.id || t.category))
                        ?.name || "—"
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  {t.account
                    ? accounts.find((a) => a.id === (t.account.id || t.account))
                        ?.name || "—"
                    : "—"}
                </td>

                <td className={`px-3 py-2 font-medium ${t.amount < 0 ? "text-red-500" : "text-green-600"}`}>{t.amount}</td>
                <td className="px-3 py-2 flex justify-center gap-2">
                  <button onClick={() => openForm("view", t)} className="text-blue-500 hover:text-blue-700"><Eye size={16} /></button>
                  <button onClick={() => openForm("edit", t)} className="text-green-500 hover:text-green-700"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">No transactions found</td>
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
                    {a.name}
                  </option>
                ))}
              </select>

                  <input name="amount" type="number" defaultValue={selected?.amount || ""} className="border px-3 py-2 rounded" required />

                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="border px-3 py-2 rounded" required>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                    <option value="Transfer">Transfer</option>
                  </select>

                  {formType === "Transfer" && (
                    <select name="target_account" defaultValue={selected?.target_account?.id || ""} className="border px-3 py-2 rounded" required>
                      <option value="">Select Target Account</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  )}

                  {formType !== "Transfer" && (
                    <select
                name="category"
                defaultValue={selected?.category?.id || selected?.category || ""}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

                  )}

                  <select name="currency" defaultValue={selected?.currency?.code || "USD"} className="border px-3 py-2 rounded" required>
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>

                  {/* Transaction Splits */}
                  {formType !== "Transfer" && (
                    <div className="border rounded p-3">
                      <h3 className="font-semibold mb-2">Splits</h3>
                      {splits.map((s, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                        <select name="category" defaultValue={selected?.category?.id || ""} className="border px-3 py-2 rounded">
                    <option value="">No Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                          <input type="number" value={s.amount} onChange={(e) => handleSplitChange(i, "amount", e.target.value)} placeholder="Amount" className="border px-2 py-1 rounded w-24" />
                          <button type="button" onClick={() => removeSplit(i)} className="text-red-500 font-bold">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={addSplit} className="bg-gray-200 px-3 py-1 rounded text-sm">Add Split</button>
                    </div>
                  )}

                  <button type="submit" className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                    {openModal === "add" ? "Add" : "Save"} Transaction
                  </button>
                </form>
              </div>
            )}

            {openModal === "view" && selected && (
              <div>
                <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
                <p><b>Date:</b> {selected.transaction_date}</p>
                <p><b>Description:</b> {selected.description}</p>
                <p><b>Category:</b> {categoryMap[selected.category?.id] || "—"}</p>
               <p><b>Account:</b> {accountMap[selected.account?.id] || "—"}</p>
                <p><b>Amount:</b> {selected.amount}</p>
                <p><b>Type:</b> {selected.type}</p>
                <p><b>Currency:</b> {selected.currency?.code}</p>
                {selected.type === "Transfer" && <p><b>Target Account:</b> {accountMap[selected.target_account?.id] || "—"}</p>}

             {selected.splits && selected.splits.length > 0 && (
  <div className="mt-2">
    <h3 className="font-semibold">Splits</h3>
    <ul>
      {selected.splits.map((s, i) => (
        <li key={i}>{categoryMap[s.category] || "—"}: {s.amount}</li>
      ))}
    </ul>
  </div>
)}

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}  