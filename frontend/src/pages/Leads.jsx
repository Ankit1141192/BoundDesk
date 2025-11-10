// src/pages/Leads.jsx
import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import axios from "axios";
import Loader from "../components/Loader";
import { api } from "../utils/api";

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
    props.priority === "Hot"
      ? "#f44336"
      : props.priority === "Warm"
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

const SmallButton = styled.button`
  padding: 0.4rem 0.75rem;
  border-radius: 0.6rem;
  border: none;
  background: #e1e6ed;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 3px 3px 6px #bec3cf, -3px -3px 6px #ffffff;
`;

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [newLead, setNewLead] = useState({
    name: "", email: "", phone: "", company: "", teamId: "", priority: "Warm", status: "NEW", value: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [leadsToShow, setLeadsToShow] = useState(10);

  // enquiry state
  const [enquiryState, setEnquiryState] = useState(null); // { lead, type, message, sending }
  const messageRef = useRef(null);

  // user + token from localStorage (your app should set these on login)
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch (e) { user = null; }
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const axiosInstance = axios.create({
    baseURL: api,
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  useEffect(() => {
    fetchTeams();
    fetchLeads();
    return () => document.body.classList.remove("modal-open");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = "/leads";
      const res = await axiosInstance.get(url);
      setLeads(res.data || []);
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
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.email) return alert("Name and Email are required");
    try {
      const payload = {
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone || undefined,
        company: newLead.company || undefined,
        teamId: newLead.teamId || null,
        priority: newLead.priority,
        status: newLead.status || "NEW",
        value: newLead.value ? Number(String(newLead.value).replace(/[^0-9.-]+/g, "")) : undefined,
        ownerId: user?.id,
      };
      const res = await axiosInstance.post("/leads", payload);
      setLeads((prev) => [res.data, ...prev]);
      setNewLead({ name: "", email: "", phone: "", company: "", teamId: "", priority: "Warm", status: "NEW", value: "" });
      setShowModal(false);
      document.body.classList.remove("modal-open");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create lead");
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await axiosInstance.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete lead");
    }
  };

  const openEnquiry = (lead) => {
    setEnquiryState({ lead, type: "Call", message: "", sending: false });
    document.body.classList.add("modal-open");
    setTimeout(() => messageRef.current && messageRef.current.focus(), 50);
  };

  const closeEnquiry = () => {
    setEnquiryState(null);
    document.body.classList.remove("modal-open");
  };

  const sendEnquiry = async () => {
    if (!enquiryState) return;
    if (!token) return alert("Login required to send enquiry");
    const { lead, type, message } = enquiryState;
    try {
      setEnquiryState(s => ({ ...s, sending: true }));
      const content = JSON.stringify({ type, message });
      await axiosInstance.post("/activities", { leadId: lead.id, type: "enquiry", content });
      alert("Enquiry recorded");
      closeEnquiry();
    } catch (err) {
      console.error("sendEnquiry error:", err);
      alert(err?.response?.data?.message || "Failed to send enquiry");
      setEnquiryState(s => ({ ...s, sending: false }));
    }
  };

  const filteredLeads = leads
    .filter((lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((lead) => (filterStatus ? (lead.status === filterStatus || lead.priority === filterStatus) : true))
    .filter((lead) => (filterTeam ? String(lead.teamId) === String(filterTeam) : true));

  // helper: convert status enum to friendly text
  const readableStatus = (s) => {
    if (!s) return "N/A";
    const map = {
      NEW: "New",
      OPEN: "Open",
      WON: "Won",
      LOST: "Lost",
      ARCHIVED: "Archived",
    };
    return map[s] || s;
  };

  const formatCurrency = (v) => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v || 0));
    } catch {
      return `₹${v}`;
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageWrapper blur={showModal || Boolean(enquiryState)}>
        <ContentWrapper>
          <PageTitle>Leads</PageTitle>
          <HeaderRow>
            <Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <Select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
              <option value="">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
              <Button onClick={() => {
                setShowModal(true);
                document.body.classList.add('modal-open');
              }}>Add New Lead</Button>
            )}
          </HeaderRow>

          {loading ? <Loader /> : (
            <>
              {filteredLeads.slice(0, leadsToShow).map(lead => (
                <LeadItem key={lead.id}>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "1rem" }}>{lead.name}</p>
                    <p style={{ fontSize: "0.875rem", color: "#6c7293" }}>
                      Owner: {lead.owner?.name || "N/A"} • {lead.company || ""}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#8b8fa8" }}>
                      {lead.email} {lead.phone ? ` • ${lead.phone}` : ""} {lead.value ? ` • ${formatCurrency(lead.value)}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {/* show priority badge (Hot/Warm/Cold) */}
                    <Badge priority={lead.priority}>{lead.priority || "N/A"}</Badge>
                    <div style={{ fontSize: "0.85rem", color: "#555" }}>{readableStatus(lead.status)}</div>

                    <SmallButton onClick={() => openEnquiry(lead)}>Enquire</SmallButton>

                    {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
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
              {filteredLeads.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: "#6c7293", marginTop: "2rem" }}>No leads found.</div>
              )}
            </>
          )}
        </ContentWrapper>
      </PageWrapper>

      {/* Create Modal */}
      {showModal && (
        <ModalOverlay onClick={() => { setShowModal(false); document.body.classList.remove('modal-open'); }}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>Create New Lead</ModalHeader>
            <Input placeholder="Name" value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} />
            <Input placeholder="Email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
            <Input placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} />
            <Input placeholder="Company" value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} />
            <Input placeholder="Estimated value (number)" value={newLead.value} onChange={e => setNewLead({ ...newLead, value: e.target.value })} />
            <Select value={newLead.teamId} onChange={e => setNewLead({ ...newLead, teamId: e.target.value })}>
              <option value="">No Team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Select value={newLead.priority} onChange={e => setNewLead({ ...newLead, priority: e.target.value })}>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </Select>
            <Select value={newLead.status} onChange={e => setNewLead({ ...newLead, status: e.target.value })}>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
            <Button onClick={handleCreateLead}>Add Lead</Button>
          </Modal>
        </ModalOverlay>
      )}

      {/* Enquiry Modal */}
      {enquiryState && (
        <ModalOverlay onClick={() => closeEnquiry()}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>Send Enquiry — {enquiryState.lead.name}</ModalHeader>

            <Select value={enquiryState.type} onChange={e => setEnquiryState(s => ({ ...s, type: e.target.value }))}>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
              <option value="Chat">Chat</option>
              <option value="Other">Other</option>
            </Select>

            <textarea
              ref={messageRef}
              value={enquiryState.message}
              onChange={e => setEnquiryState(s => ({ ...s, message: e.target.value }))}
              rows={5}
              style={{ borderRadius: "0.75rem", padding: "0.75rem", border: "none", background: "#e0e5ec", boxShadow: "inset 6px 6px 12px #bec3cf, inset -6px -6px 12px #ffffff", outline: "none" }}
              placeholder="Write message or notes..."
            />

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              <Button onClick={() => closeEnquiry()}>Cancel</Button>
              <Button onClick={() => sendEnquiry()} disabled={enquiryState.sending}>{enquiryState.sending ? "Sending..." : "Send"}</Button>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}
