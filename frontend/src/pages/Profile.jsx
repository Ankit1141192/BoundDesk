import { useState, useEffect, useRef } from "react";
import { Container, Card } from "../components/styles";
import axios from "axios";
import Loader from "../components/Loader";
import styled from "styled-components";
import { api } from "../utils/api";

// Neumorphic input
const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
  border: none;
  background: #e0e5ec;
  box-shadow: inset 6px 6px 12px #bec3cf, inset -6px -6px 12px #ffffff;
  outline: none;
`;

// Neumorphic button
const Button = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: none;
  background: #e0e5ec;
  box-shadow: 6px 6px 12px #bec3cf, -6px -6px 12px #ffffff;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  &:hover {
    box-shadow: inset 6px 6px 12px #bec3cf, inset -6px -6px 12px #ffffff;
  }
`;

const ProfileIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e0e5ec;
  box-shadow: 8px 8px 20px #bec3cf, -8px -8px 20px #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  svg {
    width: 40px;
    height: 40px;
    color: #6c7293;
  }
`;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: `${api}`,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users/me");
      setUser(res.data);
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.patch(`/users/${user.id}`, formData);
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) return <Loader />;

  return (
    <Container>
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <Card style={{ padding: "2rem" }}>
          <ProfileIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </ProfileIcon>

          <h2 style={{ textAlign: "center", margin: "1rem 0", color: "#3d4468" }}>
            {editing ? "Edit Profile" : "My Profile"}
          </h2>

          {editing ? (
            <>
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Button style={{ width: "100%", marginTop: "1rem" }} onClick={handleUpdate}>
                Update Profile
              </Button>
              <Button
                style={{ width: "100%", marginTop: "0.5rem" }}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "600", color: "#3d4468" }}>Name: {user.name}</p>
              <p style={{ fontWeight: "500", color: "#6c7293" }}>Email: {user.email}</p>
              <p style={{ fontWeight: "500", color: "#6c7293" }}>Phone: {user.phone || "N/A"}</p>
              <p style={{ fontWeight: "500", color: "#6c7293" }}>Role: {user.role}</p>
              <Button
                style={{ width: "100%", marginTop: "1rem" }}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
