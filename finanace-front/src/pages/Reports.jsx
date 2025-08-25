// src/pages/Reports.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { CSVLink } from "react-csv";
import { format } from "date-fns";

const TABLES = [
  "Transactions",
  "Accounts",
  "Categories",
  "Budgets",
  "RecurringBills",
  "TransactionSplits",
  "Attachments",
];

export default function Reports() {
  const [logs, setLogs] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState("Transactions");
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  // Fetch accounts and categories for mapping IDs -> names
  const fetchAccountsCategories = useCallback(async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        api.get("/accounts/"),
        api.get("/categories/"),
      ]);
      setAccounts(Array.isArray(accRes.data) ? accRes.data : accRes.data.results);
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAccountsCategories();
  }, [fetchAccountsCategories]);

  const fetchLogs = useCallback(
    async (url) => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(
          url || `/audit-logs/?table_name=${selectedTable}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        const data = response.data.results.map((log) => ({
          ...log,
          action: log.action.toUpperCase(),
        }));

        setLogs(data);
        setNext(response.data.next);
        setPrevious(response.data.previous);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    },
    [selectedTable]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Mappings ID -> name
  const accountMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const displayValue = (key, value) => {
    if (!value) return "-";
    if (key === "account") return accountMap[value] || value;
    if (key === "category") return categoryMap[value] || value;
    return value;
  };

  // Live full-text search filter
  const filteredLogs = logs.filter((log) =>
    JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy - HH:mm");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Audit Logs Report</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TABLES.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Live search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
        />

        <CSVLink
          data={filteredLogs}
          filename={`${selectedTable}-export.csv`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export CSV
        </CSVLink>

        <button
          onClick={() => fetchLogs()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Table</th>
              <th className="px-4 py-2">Record ID</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Old Data</th>
              <th className="px-4 py-2">New Data</th>
              <th className="px-4 py-2">Changed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="text-center text-red-500 p-4">
                  {error}
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  No logs found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{log.id}</td>
                  <td className="px-4 py-2">{log.user || "N/A"}</td>
                  <td className="px-4 py-2">{log.table_name}</td>
                  <td className="px-4 py-2">{log.record_id}</td>
                  <td className="px-4 py-2 font-semibold">{log.action}</td>

                  {/* Old Data */}
                  <td className="px-4 py-2">
                    {log.old_data ? (
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 max-w-xs overflow-auto">
                        {Object.entries(log.old_data).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between border-b border-gray-100 py-1 text-sm"
                          >
                            <span className="font-semibold text-gray-600">{key}</span>
                            <span className="text-gray-800 truncate">
                              {displayValue(key, value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* New Data */}
                  <td className="px-4 py-2">
                    {log.new_data ? (
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200 max-w-xs overflow-auto">
                        {Object.entries(log.new_data).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between border-b border-green-100 py-1 text-sm"
                          >
                            <span className="font-semibold text-gray-600">{key}</span>
                            <span className="text-gray-800 truncate">
                              {displayValue(key, value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-4 py-2">{formatDate(log.changed_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={!previous}
          onClick={() => fetchLogs(previous)}
          className={`px-4 py-2 rounded-lg ${
            previous
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Previous
        </button>
        <button
          disabled={!next}
          onClick={() => fetchLogs(next)}
          className={`px-4 py-2 rounded-lg ${
            next
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
