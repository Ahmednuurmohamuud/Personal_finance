import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
// import '@fullcalendar/daygrid/main.css';

export default function RecurringBillsDashboard() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" or "calendar"
  const [open, setOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [formData, setFormData] = useState({
    account: "",
    category: "",
    name: "",
    amount: "",
    currency: "",
    type: "Expense",
    frequency: "Monthly",
    start_date: "",
    next_due_date: "",
    end_date: "",
    is_active: true,
  });

  // Dropdowns
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // Summary states
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  // Fetch bills from API
  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/recurring-bills/");
      const billsData = Array.isArray(res.data.results) ? res.data.results : [];
      setBills(billsData);
      calculateSummary(billsData);
    } catch (err) {
      console.error("Error fetching bills", err);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dropdown data
  const fetchDropdowns = useCallback(async () => {
    try {
      const [accountsRes, categoriesRes, currenciesRes] = await Promise.all([
        api.get("/accounts/"),
        api.get("/categories/"),
        api.get("/currencies/"),
      ]);
      setAccounts(accountsRes.data.results || []);
      setCategories(categoriesRes.data.results || []);
      setCurrencies(currenciesRes.data.results || []);
    } catch (err) {
      console.error("Error fetching dropdowns", err);
      toast.error("Failed to load dropdown data");
    }
  }, []);

  useEffect(() => {
    fetchBills();
    fetchDropdowns();
  }, [fetchBills, fetchDropdowns]);

  const calculateSummary = (billsData) => {
    const today = new Date();
    let monthlyTotal = 0;
    let overdue = 0;
    let upcoming = 0;

    billsData.forEach((bill) => {
      const nextDue = new Date(bill.next_due_date);
      if (bill.frequency === "Monthly") monthlyTotal += parseFloat(bill.amount || 0);
      if (nextDue < today) overdue += 1;
      else if (nextDue >= today) upcoming += 1;
    });

    setTotalMonthly(monthlyTotal.toFixed(2));
    setOverdueCount(overdue);
    setUpcomingCount(upcoming);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (bill = null) => {
    if (bill) {
      setEditingBill(bill);
      setFormData(bill);
    } else {
      setEditingBill(null);
      setFormData({
        account: "",
        category: "",
        name: "",
        amount: "",
        currency: "",
        type: "Expense",
        frequency: "Monthly",
        start_date: "",
        next_due_date: "",
        end_date: "",
        is_active: true,
      });
    }
    setOpen(true);
  };

  const cleanFormData = (data) => ({
    account: data.account || null,
    category: data.category || null,
    name: data.name || "",
    amount: data.amount ? parseFloat(data.amount) : null,
    currency: data.currency || null,
    type: data.type || "Expense",
    frequency: data.frequency || "Monthly",
    start_date: data.start_date || null,
    next_due_date: data.next_due_date || null,
    end_date: data.end_date || null,
    is_active: data.is_active,
  });

  const saveBill = async () => {
    try {
      const payload = cleanFormData(formData);
      if (editingBill) {
        await api.put(`/recurring-bills/${editingBill.id}/`, payload);
        toast.success("Bill updated successfully");
      } else {
        await api.post("/recurring-bills/", payload);
        toast.success("Bill added successfully");
      }
      setOpen(false);
      fetchBills();
    } catch (err) {
      if (err.response) {
        console.error("Validation error:", err.response.data);
        toast.error("Failed to save bill: " + JSON.stringify(err.response.data));
      } else {
        console.error("Unexpected error:", err);
        toast.error("Failed to save bill");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recurring Bills</h1>
          <p className="text-gray-600">Track and manage your recurring payments</p>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => openModal()}
        >
          + Add Bill
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mt-4">
        <button
          className={`px-3 py-1 rounded ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setView("list")}
        >
          List View
        </button>
        <button
          className={`px-3 py-1 rounded ${view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          onClick={() => setView("calendar")}
        >
          Calendar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-white rounded shadow text-center">
          <p className="text-gray-500">Total Monthly Bills</p>
          <p className="text-xl font-bold">${totalMonthly}</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <p className="text-gray-500">Overdue Bills</p>
          <p className="text-xl font-bold">{overdueCount}</p>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <p className="text-gray-500">Upcoming Bills</p>
          <p className="text-xl font-bold">{upcomingCount}</p>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="mt-4 bg-white rounded shadow overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Frequency</th>
                <th className="p-2 border">Next Due</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-2 text-center">Loading...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan="5" className="p-2 text-center">No bills found</td></tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="p-2 border">{bill.name}</td>
                    <td className="p-2 border">${bill.amount}</td>
                    <td className="p-2 border">{bill.frequency}</td>
                    <td className="p-2 border">{bill.next_due_date}</td>
                    <td className="p-2 border space-x-2">
                      <button
                        className="px-2 py-1 bg-yellow-400 rounded"
                        onClick={() => openModal(bill)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded"
                        onClick={async () => {
                          await api.delete(`/recurring-bills/${bill.id}/`);
                          toast.success("Bill deleted");
                          fetchBills();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="mt-4 bg-white rounded shadow p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={bills.map(bill => ({ title: bill.name, start: bill.next_due_date }))}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 max-h-[80vh] overflow-y-auto w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editingBill ? "Edit Bill" : "Add Bill"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm mb-1">Account</label>
                <select name="account" value={formData.account} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="">Select Account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="">Select Currency</option>
                  {currencies.map(cur => <option key={cur.code} value={cur.code}>{cur.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Amount</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="w-full border p-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm mb-1">Frequency</label>
                <select name="frequency" value={formData.frequency} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="">Select Frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input type="date" name="start_date" value={formData.start_date || ""} onChange={handleChange} className="w-full border p-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm mb-1">Next Due Date</label>
                <input type="date" name="next_due_date" value={formData.next_due_date || ""} onChange={handleChange} className="w-full border p-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input type="date" name="end_date" value={formData.end_date || ""} onChange={handleChange} className="w-full border p-2 rounded"/>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={saveBill}>{editingBill ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
