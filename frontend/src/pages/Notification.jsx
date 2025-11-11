// src/components/Notifications.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Bell, Trash2, Check, Settings } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import { api } from "../utils/api";

/* ---------- Styled components ---------- */
const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #6c7293;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: ${(p) => (p.variant === "outline" ? "1px solid #ccc" : "none")};
  background: ${(p) => (p.variant === "outline" ? "transparent" : "#4a90e2")};
  color: ${(p) => (p.variant === "outline" ? "#333" : "white")};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${(p) => (p.variant === "outline" ? "#f1f1f1" : "#357ABD")};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const Card = styled.div`
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 8px 8px 20px #e2d8c8, -8px -8px 20px #ffffff;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #6c7293;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #eee;
  background: ${(props) => (props.read ? "#f9f9f9" : "#e0f7ff")};
  transition: all 0.2s;
`;

const NotificationIcon = styled.div`
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  color: ${(props) => (props.type === "success" ? "#28a745" : props.type === "warning" ? "#ffc107" : "#17a2b8")};
  background: ${(props) =>
    props.type === "success"
      ? "#d4edda"
      : props.type === "warning"
      ? "#fff3cd"
      : "#d1ecf1"};
`;

const NotificationText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NotificationTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  color: white;
  background: #ff3b30;
`;

const NotificationDescription = styled.p`
  font-size: 0.875rem;
  color: #6c7293;
`;

const NotificationTime = styled.p`
  font-size: 0.75rem;
  color: #999;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c7293;
  padding: 1.5rem;
`;

/* ---------- Helpers ---------- */

const deriveSocketUrl = () => {
  // 1) explicit override via env
  if (api) return api;
  // 2) if `api` exists and contains /api path, strip it to get base URL
  if (api && typeof api === "string") {
    try {
      // remove trailing /api, /api/v1, /api/v2 etc
      return api.replace(/\/api(\/v\d+)?\/?$/, "");
    } catch (e) {
      // fallthrough
    }
  }
  // 3) fallback to current origin
  if (typeof window !== "undefined" && window.location) return window.location.origin;
  return null;
};

const getId = (n) => n.id || n._id || (n && n._id && String(n._id)) || null;

/* ---------- Component ---------- */
export default function Notifications({ apiBase = api || "" }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }

  const axiosInstance = axios.create({
    baseURL: apiBase || undefined,
    headers: { Authorization: token ? `Bearer ${token}` : "" },
    timeout: 10000,
  });

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("[Notifications] mounting — fetching notifications");
    fetchNotifications();

    const socketUrl = deriveSocketUrl();
    let s;
    if (socketUrl) {
      s = io(socketUrl, {
        auth: { token: token ? `Bearer ${token}` : "" },
        transports: ["websocket", "polling"],
      });
      setSocket(s);

      s.on("connect", () => console.log(`[Notifications] socket connected ${s.id} @ ${socketUrl}`));
      s.on("connect_error", (err) => console.warn("[Notifications] socket connect_error", err?.message || err));
      s.on("notification:created", (payload) => {
        console.log("[Notifications] socket payload:", payload);
        const payloadUserId = payload?.userId || payload?.user?._id || payload?.user?.id;
        if (String(payloadUserId) === String(user?.id)) {
          setNotifications((prev) => [payload, ...prev]);
        }
      });
    } else {
      console.warn("[Notifications] no socket URL derived; skipping socket connection");
    }

    return () => {
      if (s && s.disconnect) s.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    if (!user) {
      console.warn("[Notifications] no user in localStorage");
      if (process.env.NODE_ENV === "development") {
        // show a dev sample so UI is visible while developing
        setNotifications([
          {
            id: "dev-sample-1",
            title: "Sample notification (dev)",
            description: "This is a dev sample. Log in to see real notifications.",
            type: "info",
            read: false,
            createdAt: new Date().toISOString(),
            link: null,
          },
        ]);
      } else {
        setNotifications([]);
      }
      setLoading(false);
      return;
    }

    try {
      // prefer an authenticated endpoint like /notifications/me if available in backend
      const endpoint = `/notifications?userId=${user.id}`;
      console.log("[Notifications] GET", endpoint);
      const res = await axiosInstance.get(endpoint);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("[Notifications] fetch error:", err?.response?.data || err.message || err);
      // keep UI usable (no crash)
      if (process.env.NODE_ENV === "development" && (!notifications || notifications.length === 0)) {
        setNotifications([
          {
            id: "dev-fallback-1",
            title: "Sample fallback (dev)",
            description: "Backend failed to respond — sample shown.",
            type: "warning",
            read: false,
            createdAt: new Date().toISOString(),
            link: null,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    try {
      await axiosInstance.put("/notifications/mark-all-read", { userId: user.id });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("[Notifications] markAllRead error:", err);
    }
  };

  const markRead = async (id) => {
    if (!id) return;
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (String(getId(n)) === String(id) ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("[Notifications] markRead error:", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!id) return;
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => String(getId(n)) !== String(id)));
    } catch (err) {
      console.error("[Notifications] deleteNotification error:", err);
    }
  };

  return (
    <Container>
      <Header>
        <TitleGroup>
          <Title>Notifications</Title>
          <Subtitle>Stay updated with your latest activities</Subtitle>
        </TitleGroup>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="outline" onClick={markAllRead} title="Mark all as read">
            <Check className="h-4 w-4" /> Mark All Read
          </Button>
          <Button variant="outline" title="Open notification settings">
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </div>
      </Header>

      <StatsGrid>
        <Card>
          <CardHeader>
            <CardTitle>Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: "2rem", fontWeight: "700" }}>{unreadCount}</p>
            <p style={{ fontSize: "0.75rem", color: "#6c7293" }}>notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: "2rem", fontWeight: "700" }}>{notifications.length}</p>
            <p style={{ fontSize: "0.75rem", color: "#6c7293" }}>notifications</p>
          </CardContent>
        </Card>
      </StatsGrid>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Your recent notifications and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <EmptyState>Loading notifications…</EmptyState>}

          {!loading && notifications.length === 0 && <EmptyState>No notifications yet.</EmptyState>}

          {!loading &&
            notifications.map((notification) => {
              const nid = getId(notification) || JSON.stringify(notification).slice(0, 8);
              const timeDisplay = notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : notification.time || "";
              return (
                <NotificationItem key={nid} read={notification.read}>
                  <NotificationIcon type={notification.type}>
                    <Bell className="h-5 w-5" />
                  </NotificationIcon>

                  <NotificationText>
                    <NotificationTitleRow>
                      <p
                        style={{ fontWeight: "600", cursor: "pointer" }}
                        onClick={() => {
                          markRead(nid);
                          if (notification.link) {
                            // prefer client-side routing if available (replace with your router push),
                            // otherwise fallback to location.href
                            if (window && window.history && window.history.pushState && typeof window.routerPush === "function") {
                              window.routerPush(notification.link);
                            } else {
                              window.location.href = notification.link;
                            }
                          }
                        }}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && <Badge>New</Badge>}
                    </NotificationTitleRow>

                    <NotificationDescription>{notification.description}</NotificationDescription>
                    <NotificationTime>{timeDisplay}</NotificationTime>
                  </NotificationText>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {!notification.read && (
                      <Button variant="outline" onClick={() => markRead(nid)} style={{ padding: "0.35rem 0.5rem" }} title="Mark read">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => deleteNotification(nid)} style={{ padding: "0.35rem 0.5rem" }} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </NotificationItem>
              );
            })}
        </CardContent>
      </Card>
    </Container>
  );
}
