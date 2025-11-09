import { useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

import maximize from "../assets/maximize.png";
import shrink from "../assets/shrink.png";

import { 
  LayoutDashboard, Users, Activity, Bell, Settings, LogOut 
} from "lucide-react";
import { Card } from "./styles";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Activities", url: "/activities", icon: Activity },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const settingsItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

const SidebarNavbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/");
  };

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside className={`h-screen transition-all duration-300 flex flex-col ${collapsed ? "w-20" : "w-64"}`}>
      <Card className={`flex flex-col h-full p-4 relative`}>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-4 top-4 bg-[#e0e5ec] p-1 rounded-full shadow-[4px_4px_8px_#bec3cf,-4px_-4px_8px_#ffffff] z-10"
        >
          <img
            src={collapsed ? maximize : shrink}
            alt={collapsed ? "Expand" : "Collapse"}
            className="w-6 h-6"
          />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <h1 className={`font-bold text-xl transition-all duration-300 ${collapsed ? "text-sm" : ""}`}>
            {collapsed ? "Desk" : "Bound Desk"}
          </h1>
        </div>

        {/* Main Menu */}
        <div className="flex-1 w-full flex flex-col gap-2">
          {!collapsed && <p className="text-gray-500 text-xs mb-2 uppercase">Main Menu</p>}
          {mainItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center justify-${collapsed ? "center" : "start"} gap-3 p-3 rounded-xl text-gray-700 shadow-[8px_8px_16px_#bec3cf,-8px_-8px_16px_#ffffff] hover:bg-[#f0f0f0] transition-colors ${
                  isActive ? "bg-[#e0e5ec] font-semibold" : ""
                }`
              }
            >
              <item.icon className="w-5 h-5 min-w-[35px]" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>

        {/* System Menu */}
        <div className="w-full mt-4 border-t pt-4 flex flex-col gap-2">
          {!collapsed && <p className="text-gray-500 text-xs mb-2 uppercase">System</p>}
          {settingsItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center justify-${collapsed ? "center" : "start"} gap-3 p-3 rounded-xl text-gray-700 shadow-[8px_8px_16px_#bec3cf,-8px_-8px_16px_#ffffff] hover:bg-[#f0f0f0] transition-colors ${
                  isActive ? "bg-[#e0e5ec] font-semibold" : ""
                }`
              }
            >
              <item.icon className="w-5 h-5 min-w-[20px]" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div className="w-full mt-auto border-t pt-4">
          <button
            onClick={handleLogout}
            className={`flex items-center justify-${collapsed ? "center" : "start"} gap-3 p-3 rounded-xl text-gray-700 shadow-[8px_8px_16px_#bec3cf,-8px_-8px_16px_#ffffff] hover:bg-[#f0f0f0] w-full transition-colors`}
          >
            <LogOut className="w-5 h-5 min-w-[20px]" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

      </Card>
    </aside>
  );
};

export default SidebarNavbar;
