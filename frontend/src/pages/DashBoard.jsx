import React from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Card = styled.div`
  padding: 1rem;
  background-color: #fff9ed;
  border-radius: 1rem;
  box-shadow: 8px 8px 20px #e2d8c8, -8px -8px 20px #ffffff;
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const ChartGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const LeadItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e0e5ec;
  background-color: #fff;
  transition: all 0.2s;
  &:hover {
    background-color: #f0f3f7;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: white;
  background-color: ${(props) =>
    props.status === "Hot"
      ? "#f44336"
      : props.status === "Warm"
      ? "#ff9800"
      : "#9e9e9e"};
`;

const salesData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

const leadSourceData = [
  { name: "Website", value: 400, color: "#4CAF50" },
  { name: "Referral", value: 300, color: "#FF9800" },
  { name: "Social Media", value: 200, color: "#2196F3" },
  { name: "Email", value: 100, color: "#9C27B0" },
];

const recentLeads = [
  { id: 1, name: "Acme Corp", status: "Hot", value: "$50,000", owner: "John Doe" },
  { id: 2, name: "TechStart Inc", status: "Warm", value: "$30,000", owner: "Jane Smith" },
  { id: 3, name: "Global Solutions", status: "Cold", value: "$20,000", owner: "Mike Johnson" },
  { id: 4, name: "Innovation Labs", status: "Hot", value: "$75,000", owner: "Sarah Williams" },
];

const Dashboard = () => {
  return (
    <Container>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-gray-600">Welcome back! Here's what's happening today.</p>

      {/* Stats */}
      <StatsGrid>
        <Card>
          <h3 className="text-sm font-medium">Total Leads</h3>
          <p className="text-2xl font-bold">1,284</p>
          <p className="text-green-600">+12.5% from last month</p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium">Active Deals</h3>
          <p className="text-2xl font-bold">342</p>
          <p className="text-green-600">+8.2% from last month</p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium">Conversion Rate</h3>
          <p className="text-2xl font-bold">24.8%</p>
          <p className="text-red-600">-2.1% from last month</p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium">Revenue</h3>
          <p className="text-2xl font-bold">$284,500</p>
          <p className="text-green-600">+18.7% from last month</p>
        </Card>
      </StatsGrid>

      {/* Charts */}
      <ChartGrid>
        <Card>
          <h3 className="mb-2 font-semibold">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4CAF50" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold">Lead Sources</h3>
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </ChartGrid>

      {/* Recent Leads */}
      <Card>
        <h3 className="mb-2 font-semibold">Recent Leads</h3>
        <div className="space-y-2">
          {recentLeads.map((lead) => (
            <LeadItem key={lead.id}>
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-sm text-gray-500">Owner: {lead.owner}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={lead.status}>{lead.status}</Badge>
                <p className="font-semibold">{lead.value}</p>
              </div>
            </LeadItem>
          ))}
        </div>
      </Card>
    </Container>
  );
};

export default Dashboard;
