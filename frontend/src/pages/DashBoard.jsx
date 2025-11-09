import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Loader from "../components/Loader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { api } from "../utils/api";

const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Card = styled.div`
  padding: 1.5rem;
  background: #fff9ed;
  border-radius: 1.5rem;
  box-shadow: 8px 8px 20px #e2d8c8, -8px -8px 20px #ffffff;
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const ChartGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
`;

const LeadItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid #e0e5ec;
  background: #fff9ed;
  box-shadow: inset 4px 4px 8px #bec3cf, inset -4px -4px 8px #ffffff;
  transition: all 0.2s;
  &:hover {
    box-shadow: 8px 8px 20px #e2d8c8, -8px -8px 20px #ffffff;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: white;
  background-color: ${(props) =>
    props.status === "Hot"
      ? "#f44336"
      : props.status === "Warm"
      ? "#ff9800"
      : "#9e9e9e"};
`;

const ActionButton = styled.button`
  padding: 0.3rem 0.6rem;
  margin-left: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: white;
  background-color: ${(props) => (props.delete ? "#f44336" : "#375e95ff")};
  &:hover {
    opacity: 0.8;
  }
`;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [ownLeads, setOwnLeads] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: `${api}`,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userRes = await axiosInstance.get("/users/me");
      const currentUser = userRes.data;
      setUser(currentUser);

      let leadsRes;
      if (currentUser.role === "ADMIN") {
        leadsRes = await axiosInstance.get("/leads");
      } else if (currentUser.role === "MANAGER") {
        leadsRes = await axiosInstance.get(`/leads?teamId=${currentUser.teamId}`);
      } else {
        leadsRes = await axiosInstance.get(`/leads?ownerId=${currentUser.id}`);
      }

      const allLeads = leadsRes.data;
      setLeads(allLeads);

      const ownLeadsData = allLeads.filter(lead => lead.ownerId === currentUser.id);
      setOwnLeads(ownLeadsData);

      const teamsRes = await axiosInstance.get("/teams");
      setTeams(teamsRes.data);

      if (currentUser.role === "ADMIN") {
        const usersRes = await axiosInstance.get("/users");
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await axiosInstance.delete(`/leads/${leadId}`);
      fetchDashboardData(); // refresh leads
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead");
    }
  };

  if (loading || !user) return <Loader />;

  const salesData = leads.map((lead) => ({
    name: lead.name,
    value: parseInt(lead.value?.replace(/\D/g, "") || 0),
  }));

  const leadSourceData = leads.reduce((acc, lead) => {
    const source = lead.source || "Website";
    const found = acc.find((l) => l.name === source);
    if (found) found.value += 1;
    else
      acc.push({
        name: source,
        value: 1,
        color: "#" + ((1 << 24) * Math.random() | 0).toString(16),
      });
    return acc;
  }, []);

  return (
    <Container>
      <div>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>Dashboard</h1>
        <p style={{ color: "#6c7293" }}>Welcome back, {user.name}!</p>
      </div>

      <StatsGrid>
        <Card>
          <h3>Total Leads</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>{leads.length}</p>
        </Card>
        <Card>
          <h3>My Leads</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>{ownLeads.length}</p>
        </Card>
        <Card>
          <h3>Total Teams</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>{teams.length}</p>
        </Card>
        {user.role === "ADMIN" && (
          <Card>
            <h3>Total Users</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "700" }}>{users.length}</p>
          </Card>
        )}
      </StatsGrid>

      <ChartGrid>
        <Card>
          <h3>Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#375e95ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3>Lead Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadSourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {leadSourceData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </ChartGrid>

      <Card>
        <h3>Recent Leads</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {leads.slice(0, 5).map((lead) => (
            <LeadItem key={lead.id}>
              <div>
                <p style={{ fontWeight: "600" }}>{lead.name}</p>
                <p style={{ fontSize: "0.875rem", color: "#6c7293" }}>
                  Owner: {lead.owner?.name || "N/A"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Badge status={lead.status}>{lead.status || "N/A"}</Badge>
                <p style={{ fontWeight: "600" }}>{lead.value || "$0"}</p>

                {/* CRUD buttons based on role */}
                {(user.role === "ADMIN" || 
                  (user.role === "MANAGER" && lead.owner?.teamId === user.teamId)) && (
                  <>
                    <ActionButton>Edit</ActionButton>
                    <ActionButton delete onClick={() => handleDelete(lead.id)}>Delete</ActionButton>
                  </>
                )}
              </div>
            </LeadItem>
          ))}
        </div>
      </Card>
    </Container>
  );
}
