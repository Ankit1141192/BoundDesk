import { useState, useEffect, useRef } from "react";
import { Container, Card, Input, Button, ProfileIcon } from "../components/styles";
import axios from "axios";
import Loader from "../components/Loader";
import { api } from "../utils/api";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Center loader in UI instead of a raw return
  if (loading || !user) {
    return (
      <Container>
        <div style={{ maxWidth: "500px", width: "100%" }}>


          <Loader />

        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <Card style={{ padding: "2rem" }}>
          <ProfileIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
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
