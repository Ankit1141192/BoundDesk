import { useState, useEffect } from "react";
import styled from "styled-components";
import { Bell, Trash2, Check, Settings } from "lucide-react";

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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #ccc;
  background: ${(props) => (props.variant === "outline" ? "transparent" : "#4a90e2")};
  color: ${(props) => (props.variant === "outline" ? "#333" : "white")};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${(props) => (props.variant === "outline" ? "#f1f1f1" : "#357ABD")};
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
  border: 1px solid #ccc;
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

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Lead Assigned", description: "Acme Corporation assigned to you", time: "5 minutes ago", read: false, type: "info" },
    { id: 2, title: "Meeting Reminder", description: "Demo with Innovation Labs in 1 hour", time: "55 minutes ago", read: false, type: "warning" },
    { id: 3, title: "Lead Status Updated", description: "TechStart Inc moved to Hot status", time: "2 hours ago", read: false, type: "success" },
    { id: 4, title: "Email Received", description: "New email from john@acme.com", time: "3 hours ago", read: true, type: "info" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container>
      <Header>
        <TitleGroup>
          <Title>Notifications</Title>
          <Subtitle>Stay updated with your latest activities</Subtitle>
        </TitleGroup>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="outline">
            <Check className="h-4 w-4" /> Mark All Read
          </Button>
          <Button variant="outline">
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
            <CardTitle>Total Today</CardTitle>
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
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} read={notification.read}>
              <NotificationIcon type={notification.type}>
                <Bell className="h-5 w-5" />
              </NotificationIcon>
              <NotificationText>
                <NotificationTitleRow>
                  <p style={{ fontWeight: "600" }}>{notification.title}</p>
                  {!notification.read && <Badge>New</Badge>}
                </NotificationTitleRow>
                <NotificationDescription>{notification.description}</NotificationDescription>
                <NotificationTime>{notification.time}</NotificationTime>
              </NotificationText>
              <Button variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            </NotificationItem>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
}
