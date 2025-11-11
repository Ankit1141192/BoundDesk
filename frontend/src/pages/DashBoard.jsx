import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { api } from "../utils/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [ownLeads, setOwnLeads] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Create axios instance depending on api export
  const axiosInstance = useMemo(() => {
    if (!api) return axios.create({ headers: { Authorization: `Bearer ${token}` } });
    if (typeof api === "string") return axios.create({ baseURL: api, headers: { Authorization: `Bearer ${token}` } });
    // assume api is axios instance
    return api;
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setError(null);
    setLoading(true);
    try {
      const userRes = await axiosInstance.get("/users/me");
      const currentUser = userRes?.data;
      if (!currentUser) throw new Error("No user returned from /users/me");
      setUser(currentUser);

      let leadsRes;
      if (currentUser.role === "ADMIN") {
        leadsRes = await axiosInstance.get("/leads");
      } else if (currentUser.role === "MANAGER") {
        leadsRes = await axiosInstance.get(`/leads?teamId=${currentUser.teamId}`);
      } else {
        leadsRes = await axiosInstance.get(`/leads?ownerId=${currentUser.id}`);
      }
      const allLeads = leadsRes?.data || [];
      setLeads(allLeads);
      setOwnLeads(allLeads.filter(l => String(l.ownerId) === String(currentUser.id)));

      try {
        const teamsRes = await axiosInstance.get("/teams");
        setTeams(teamsRes?.data || []);
      } catch (tErr) {
        // non-fatal
        console.warn("Teams fetch failed:", tErr);
      }

      if (currentUser.role === "ADMIN") {
        try {
          const usersRes = await axiosInstance.get("/users");
          setUsers(usersRes?.data || []);
        } catch (uErr) {
          console.warn("Users fetch failed:", uErr);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      const msg = err?.response?.data?.message || err.message || "Failed to fetch dashboard data";
      setError(msg);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await axiosInstance.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(x => String(x.id) !== String(id)));
      setOwnLeads(prev => prev.filter(x => String(x.id) !== String(id)));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  // parsing helper for currency-like strings
  const parseVal = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    const cleaned = String(v).replace(/[^0-9.-]+/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  // --- Monthly sales aggregation ---
  const monthlySales = useMemo(() => {
    const getDate = (lead) => {
      const d = lead.createdAt || lead.created_at || lead.created || lead.date || null;
      if (!d) return new Date();
      const parsed = new Date(d);
      if (!isNaN(parsed)) return parsed;
      // try replace hyphens to slashes for Safari-like parsing
      const alt = new Date(String(d).replace(/-/g, "/"));
      return isNaN(alt) ? new Date() : alt;
    };

    const map = {};
    leads.forEach(lead => {
      const dt = getDate(lead);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const val = parseVal(lead.value);
      map[key] = (map[key] || 0) + val;
    });

    const arr = Object.keys(map).sort().map(key => {
      const [year, month] = key.split("-").map(Number);
      const dateObj = new Date(year, month - 1, 1);
      const label = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(dateObj);
      return { key, dateObj, name: label, value: Math.round(map[key]) };
    });
    return arr;
  }, [leads]);

  const bestMonth = useMemo(() => {
    if (!monthlySales || monthlySales.length === 0) return null;
    return monthlySales.reduce((b, cur) => (cur.value > b.value ? cur : b), monthlySales[0]);
  }, [monthlySales]);

  // --- Lead source data for pie chart ---
  const sourceData = useMemo(() => {
    const map = {};
    leads.forEach(l => {
      const s = l.source || "Website";
      map[s] = (map[s] || 0) + 1;
    });
    const colors = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return Object.keys(map).map((k, i) => ({ name: k, value: map[k], color: colors[i % colors.length] }));
  }, [leads]);

  // quick totals
  const totalLeads = leads.length;
  const myLeads = ownLeads.length;
  const totalTeams = teams.length;
  const totalUsers = users.length;

  // --- UI states: loading overlay or error overlay (full-screen) ---
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
        <Loader size={64} text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-4">
        <div className="max-w-xl w-full bg-red-50 border border-red-200 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load dashboard</h3>
          <p className="text-sm text-red-700 mb-4">{String(error)}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchDashboardData()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:opacity-95"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:opacity-95"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Normal Dashboard UI ---
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name || "User"}!</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Leads</div>
          <div className="text-2xl font-semibold">{totalLeads}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">My Leads</div>
          <div className="text-2xl font-semibold">{myLeads}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Teams</div>
          <div className="text-2xl font-semibold">{totalTeams}</div>
        </div>
        {user?.role === "ADMIN" && (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-semibold">{totalUsers}</div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Sales */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">Monthly Sales</h3>
              <p className="text-sm text-gray-500 mt-1">
                {bestMonth
                  ? `Best month: ${bestMonth.name} — ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(bestMonth.value)}`
                  : "No sales yet"}
              </p>
            </div>
            <div className="text-sm text-gray-400">{monthlySales.length} months</div>
          </div>

          <div className="mt-4 h-56">
            {monthlySales.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)} />
                  <Bar dataKey="value">
                    {monthlySales.map((entry) => {
                      const isBest = bestMonth && entry.key === bestMonth.key;
                      return <Cell key={entry.key} fill={isBest ? "#ef4444" : "#375e95"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No sales data</div>
            )}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Lead Sources</h3>
            <div className="text-sm text-gray-400">{sourceData.length} sources</div>
          </div>

          <div className="mt-4 h-56 flex items-center">
            {sourceData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourceData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full text-center text-gray-400">No lead sources</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Recent Leads</h3>
          <div className="text-sm text-gray-400">{leads.length} total</div>
        </div>

        <div className="space-y-2">
          {leads.slice(0, 8).length === 0 && <div className="text-gray-400">No recent leads</div>}
          {leads.slice(0, 8).map((l) => (
            <div key={l.id} className="flex items-center justify-between border rounded-md px-3 py-2">
              <div>
                <Link to={`/leads/${l.id}`} className="font-semibold text-gray-800 hover:underline">
                  {l.name || "Unnamed"}
                </Link>
                <div className="text-sm text-gray-500">
                  {l.owner?.name || "N/A"} • {l.company || ""}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-white text-xs px-2 py-1 rounded ${l.priority === "Hot" ? "bg-red-500" : l.priority === "Warm" ? "bg-yellow-500" : "bg-gray-400"}`}>
                  {l.priority || l.status || "N/A"}
                </span>
                <div className="font-semibold">{l.value ? String(l.value) : "₹0"}</div>
                <button onClick={() => navigate(`/leads/${l.id}`)} className="px-2 py-1 bg-indigo-600 text-white rounded text-sm">View</button>
                <button onClick={() => navigate(`/leads/${l.id}/edit`)} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Edit</button>
                {(user?.role === "ADMIN" || (user?.role === "MANAGER" && String(l.owner?.teamId) === String(user.teamId))) && (
                  <button onClick={() => handleDelete(l.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

