// src/pages/Activities.jsx
import { useState, useEffect, useRef } from "react";
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
  background: #4a90e2;
  color: white;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 4px 4px 8px #bec3cf, -4px -4px 8px #ffffff;
  transition: 0.2s;
  &:hover {
    box-shadow: inset 4px 4px 8px #bec3cf, inset -4px -4px 8px #ffffff;
    background: #357ABD;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  background: #e0e5ec;
  box-shadow: 6px 6px 12px #bec3cf, -6px -6px 12px #ffffff;
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

export default function Activities({ leadId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "Call", content: "", scheduledAt: "" });
  const [showModal, setShowModal] = useState(false);

  const messageRef = useRef(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


  const axiosInstance = axios.create({
    baseURL: api,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  useEffect(() => {
    if (!leadId) return;
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/activities/lead/${leadId}`);
      setActivities(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!newActivity.content) return alert("Content required");
    if (!token) return alert("Login required to create activity");
    try {
      const payload = { ...newActivity, leadId };
      const res = await axiosInstance.post("/activities", payload);
      setActivities((prev) => [...prev, res.data]); // returned activity appended in chronological order
      setNewActivity({ type: "Call", content: "", scheduledAt: "" });
      setShowModal(false);
      document.body.classList.remove("modal-open");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create activity");
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageWrapper blur={showModal}>
        <ContentWrapper>
          <PageTitle>Activities</PageTitle>
          <HeaderRow>
            <Button onClick={() => { setShowModal(true); document.body.classList.add('modal-open'); }}>Add Activity</Button>
          </HeaderRow>

          {loading ? <Loader /> : (
            <>
              {activities.length === 0 && <div style={{ textAlign: "center", color: "#6c7293", padding: "2rem" }}>No activities yet</div>}
              {activities.map(act => (
                <ActivityItem key={act.id}>
                  <div>
                    <p style={{ fontWeight: "600" }}>{act.type}</p>
                    <p style={{ fontSize: "0.875rem", color: "#6c7293" }}>
                      {act.content}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#999" }}>
                      By: {act.user?.name || "N/A"} | {new Date(act.createdAt).toLocaleString()}
                    </p>
                  </div>
                </ActivityItem>
              ))}
            </>
          )}
        </ContentWrapper>
      </PageWrapper>

      {showModal && (
        <ModalOverlay onClick={() => { setShowModal(false); document.body.classList.remove('modal-open'); }}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>Add Activity</ModalHeader>
            <Select value={newActivity.type} onChange={e => setNewActivity({ ...newActivity, type: e.target.value })}>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
              <option value="message">Message</option>
              <option value="enquiry">Enquiry</option>
            </Select>
            <Input
              placeholder="Content"
              value={newActivity.content}
              onChange={e => setNewActivity({ ...newActivity, content: e.target.value })}
            />
            <Input
              type="datetime-local"
              value={newActivity.scheduledAt}
              onChange={e => setNewActivity({ ...newActivity, scheduledAt: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Button onClick={() => { setShowModal(false); document.body.classList.remove('modal-open'); }}>Cancel</Button>
              <Button onClick={handleCreateActivity}>Add Activity</Button>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}
