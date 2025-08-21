import React, { useState } from "react";
import { Search, Eye, Edit2, Trash2, Plus, Download, RefreshCcw } from "lucide-react";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({
    category: "All",
    account: "All",
    type: "All",
    startDate: "",
    endDate: "",
  });
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2024-01-15", description: "Whole Foods Market", category: "Groceries", account: "Chase Checking", amount: -87.43, type: "Expense" },
    { id: 2, date: "2024-01-14", description: "Salary Deposit", category: "Income", account: "Chase Checking", amount: 2600.0, type: "Income" },
    { id: 3, date: "2024-01-13", description: "Transfer to Savings", category: "Transfer", account: "Savings Account", amount: 500.0, type: "Transfer" },
    { id: 4, date: "2024-01-12", description: "Netflix Subscription", category: "Entertainment", account: "Credit Card", amount: -15.99, type: "Expense" },
    { id: 5, date: "2024-01-11", description: "Gas Station", category: "Transportation", account: "Chase Checking", amount: -45.2, type: "Expense" },
    { id: 6, date: "2024-01-10", description: "Coffee Shop", category: "Dining", account: "Chase Checking", amount: -8.75, type: "Expense" },
  ]);

  const [openModal, setOpenModal] = useState(null); // "view" | "edit" | "add"
  const [selected, setSelected] = useState(null);

  const handleDelete = (id) => setTransactions(transactions.filter((t) => t.id !== id));

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter.category === "All" || t.category === filter.category;
    const matchesAccount = filter.account === "All" || t.account === filter.account;
    const matchesType = filter.type === "All" || t.type === filter.type;
    const matchesStart = !filter.startDate || new Date(t.date) >= new Date(filter.startDate);
    const matchesEnd = !filter.endDate || new Date(t.date) <= new Date(filter.endDate);
    return matchesSearch && matchesCategory && matchesAccount && matchesType && matchesStart && matchesEnd;
  });

  const handleClearFilters = () => {
    setFilter({ category: "All", account: "All", type: "All", startDate: "", endDate: "" });
    setSearch("");
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Date", "Description", "Category", "Account", "Amount", "Type"],
      ...filteredTransactions.map((t) => [t.date, t.description, t.category, t.account, t.amount, t.type])
    ]
      .map(e => e.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-500">Manage and track all your financial transactions</p>
        </div>
        <button
          onClick={() => { setSelected(null); setOpenModal("add"); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16}/> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <input type="date" value={filter.startDate} onChange={(e)=>setFilter({...filter,startDate:e.target.value})} className="border px-3 py-2 rounded" placeholder="Start Date"/>
        <input type="date" value={filter.endDate} onChange={(e)=>setFilter({...filter,endDate:e.target.value})} className="border px-3 py-2 rounded" placeholder="End Date"/>
        <select value={filter.category} onChange={(e)=>setFilter({...filter,category:e.target.value})} className="border px-3 py-2 rounded">
          <option value="All">All Categories</option>
          <option>Groceries</option>
          <option>Income</option>
          <option>Entertainment</option>
          <option>Transportation</option>
          <option>Dining</option>
          <option>Transfer</option>
        </select>
        <select value={filter.account} onChange={(e)=>setFilter({...filter,account:e.target.value})} className="border px-3 py-2 rounded">
          <option value="All">All Accounts</option>
          <option>Chase Checking</option>
          <option>Savings Account</option>
          <option>Credit Card</option>
        </select>
        <select value={filter.type} onChange={(e)=>setFilter({...filter,type:e.target.value})} className="border px-3 py-2 rounded">
          <option value="All">All Types</option>
          <option>Income</option>
          <option>Expense</option>
          <option>Transfer</option>
        </select>
        <button onClick={handleClearFilters} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"><RefreshCcw size={16}/> Clear Filters</button>
        <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Download size={16}/> Export CSV</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">No transactions found</td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{t.date}</td>
                  <td className="py-2 px-4">{t.description}</td>
                  <td className="py-2 px-4">{t.category}</td>
                  <td className="py-2 px-4">{t.account}</td>
                  <td className={`py-2 px-4 font-medium ${t.amount < 0 ? "text-red-500" : "text-green-600"}`}>{t.amount<0?`- $${Math.abs(t.amount)}`:`+ $${t.amount}`}</td>
                  <td className="py-2 px-4 text-center flex justify-center gap-2">
                    <button onClick={()=>{setSelected(t); setOpenModal("view")}} className="text-blue-500 hover:text-blue-700"><Eye size={16}/></button>
                    <button onClick={()=>{setSelected(t); setOpenModal("edit")}} className="text-green-500 hover:text-green-700"><Edit2 size={16}/></button>
                    <button onClick={()=>handleDelete(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setOpenModal(null)}/>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative z-10">
            <button onClick={()=>setOpenModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl">✕</button>

            {openModal==="view" && selected && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Transaction Details</h2>
                <div className="space-y-2">
                  <p><b>Date:</b> {selected.date}</p>
                  <p><b>Description:</b> {selected.description}</p>
                  <p><b>Category:</b> {selected.category}</p>
                  <p><b>Account:</b> {selected.account}</p>
                  <p><b>Amount:</b> ${selected.amount}</p>
                  <p><b>Type:</b> {selected.type}</p>
                </div>
              </div>
            )}

            {openModal==="edit" && selected && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Edit Transaction</h2>
                <form className="flex flex-col gap-3" onSubmit={(e)=>{
                  e.preventDefault();
                  const updated = {
                    ...selected,
                    date:e.target.date.value,
                    description:e.target.description.value,
                    category:e.target.category.value,
                    account:e.target.account.value,
                    amount:Number(e.target.amount.value),
                    type:e.target.type.value
                  };
                  setTransactions(transactions.map(t=>t.id===selected.id?updated:t));
                  setOpenModal(null);
                }}>
                  <input name="date" type="date" defaultValue={selected.date} className="border px-3 py-2 rounded"/>
                  <input name="description" defaultValue={selected.description} placeholder="Description" className="border px-3 py-2 rounded"/>
                  <select name="category" defaultValue={selected.category} className="border px-3 py-2 rounded">
                    <option>Groceries</option>
                    <option>Income</option>
                    <option>Entertainment</option>
                    <option>Transportation</option>
                    <option>Dining</option>
                    <option>Transfer</option>
                  </select>
                  <select name="account" defaultValue={selected.account} className="border px-3 py-2 rounded">
                    <option>Chase Checking</option>
                    <option>Savings Account</option>
                    <option>Credit Card</option>
                  </select>
                  <input name="amount" type="number" defaultValue={selected.amount} className="border px-3 py-2 rounded"/>
                  <select name="type" defaultValue={selected.type} className="border px-3 py-2 rounded">
                    <option>Income</option>
                    <option>Expense</option>
                    <option>Transfer</option>
                  </select>
                  <button type="submit" className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Save Changes</button>
                </form>
              </div>
            )}

            {openModal==="add" && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Add Transaction</h2>
                <form className="flex flex-col gap-3" onSubmit={(e)=>{
                  e.preventDefault();
                  const newTransaction = {
                    id:Date.now(),
                    date:e.target.date.value,
                    description:e.target.description.value,
                    category:e.target.category.value,
                    account:e.target.account.value,
                    amount:Number(e.target.amount.value),
                    type:e.target.type.value
                  };
                  setTransactions([...transactions,newTransaction]);
                  setOpenModal(null);
                }}>
                  <input name="date" type="date" className="border px-3 py-2 rounded"/>
                  <input name="description" placeholder="Description" className="border px-3 py-2 rounded"/>
                  <select name="category" className="border px-3 py-2 rounded">
                    <option>Groceries</option>
                    <option>Income</option>
                    <option>Entertainment</option>
                    <option>Transportation</option>
                    <option>Dining</option>
                    <option>Transfer</option>
                  </select>
                  <select name="account" className="border px-3 py-2 rounded">
                    <option>Chase Checking</option>
                    <option>Savings Account</option>
                    <option>Credit Card</option>
                  </select>
                  <input name="amount" type="number" placeholder="Amount" className="border px-3 py-2 rounded"/>
                  <select name="type" className="border px-3 py-2 rounded">
                    <option>Income</option>
                    <option>Expense</option>
                    <option>Transfer</option>
                  </select>
                  <button type="submit" className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Add Transaction</button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
