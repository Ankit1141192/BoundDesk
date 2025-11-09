import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import axios from "axios";
import Loader from "../components/Loader";

const GlobalStyle = createGlobalStyle`
  body.modal-open {
    overflow: hidden;
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 2rem;
  background: #e0e5ec;
  display: flex;
  justify-content: center;
  filter: ${(props) => (props.blur ? "blur(5px)" : "none")};
  transition: filter 0.3s ease-in-out;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 900px;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;
  gap: 0.75rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: none;
  background: #e0e5ec;
  box-shadow: inset 6px 6px 12px #bec3cf, inset -6px -6px 12px #ffffff;
  outline: none;
  flex: 1;
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: none;
  background: #e0e5ec;
  box-shadow: inset 6px 6px 12px #bec3cf, inset -6px -6px 12px #ffffff;
  outline: none;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 1.5rem;
  border: none;
  background: #e1e6ed;
  color: gray;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 4px 4px 8px #bec3cf, -4px -4px 8px #ffffff;
  transition: 0.2s;
  &:hover {
    box-shadow: inset 4px 4px 8px #bec3cf, inset -4px -4px 8px #ffffff;
    background: #c4c7cbff;
  }
`;

const LeadItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  background: #e0e5ec;
  box-shadow: 6px 6px 12px #bec3cf, -6px -6px 12px #ffffff;
`;

const Badge = styled.span`
  padding: 0.3rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === "Hot"
      ? "#f44336"
      : props.status === "Warm"
      ? "#ff9800"
      : "#9e9e9e"};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  width: 420px;
  background: #e0e5ec;
  border-radius: 1.5rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 6px 6px 12px #bec3cf, -6px -6px 12px #ffffff;
`;

const ModalHeader = styled.h3`
  font-weight: 700;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
`;

const LoadMoreWrapper = styled.div`
  text-align: center;
  margin-top: 1.5rem;
`;

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [newLead, setNewLead] = useState({
    name: "", email: "", phone: "", company: "", teamId: "", status: "Warm"
  });
  const [showModal, setShowModal] = useState(false);
  const [leadsToShow, setLeadsToShow] = useState(10);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    fetchTeams();
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = "/leads";
      if (user.role !== "ADMIN") url += `?ownerId=${user.id}`;
      const res = await axiosInstance.get(url);
      setLeads(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axiosInstance.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.email) return alert("Name and Email are required");
    try {
      const payload = { ...newLead, ownerId: user.id, teamId: newLead.teamId || null };
      const res = await axiosInstance.post("/leads", payload);
      setLeads((prev) => [res.data, ...prev]);
      setNewLead({ name: "", email: "", phone: "", company: "", teamId: "", status: "Warm" });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create lead");
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      await axiosInstance.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead");
    }
  };

  const filteredLeads = leads
    .filter((lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((lead) => (filterStatus ? lead.status === filterStatus : true))
    .filter((lead) => (filterTeam ? lead.teamId === filterTeam : true));

  return (
    <>
      <GlobalStyle />
      <PageWrapper blur={showModal}>
        <ContentWrapper>
          <PageTitle>Leads</PageTitle>
          <HeaderRow>
            <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </Select>
            <Select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
              <option value="">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            {(user.role === "ADMIN" || user.role === "MANAGER") && (
              <Button onClick={() => setShowModal(true)}>Add New Lead</Button>
            )}
          </HeaderRow>

          {loading ? <Loader /> : (
            <>
              {filteredLeads.slice(0, leadsToShow).map(lead => (
                <LeadItem key={lead.id}>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "1rem" }}>{lead.name}</p>
                    <p style={{ fontSize: "0.875rem", color: "#6c7293" }}>
                      Owner: {lead.owner?.name || "N/A"}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Badge status={lead.status}>{lead.status || "N/A"}</Badge>
                    {(user.role === "ADMIN" || user.role === "MANAGER") && (
                      <Button onClick={() => handleDeleteLead(lead.id)}>Delete</Button>
                    )}
                  </div>
                </LeadItem>
              ))}
              {filteredLeads.length > leadsToShow && (
                <LoadMoreWrapper>
                  <Button onClick={() => setLeadsToShow(prev => prev + 10)}>Load More</Button>
                </LoadMoreWrapper>
              )}
            </>
          )}
        </ContentWrapper>
      </PageWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>Create New Lead</ModalHeader>
            <Input placeholder="Name" value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} />
            <Input placeholder="Email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
            <Input placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} />
            <Input placeholder="Company" value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} />
            <Select value={newLead.teamId} onChange={e => setNewLead({ ...newLead, teamId: e.target.value })}>
              <option value="">No Team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Select value={newLead.status} onChange={e => setNewLead({ ...newLead, status: e.target.value })}>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </Select>
            <Button onClick={handleCreateLead}>Add Lead</Button>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}
