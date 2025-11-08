import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Leads from "./pages/Leads";
import Dashboard from "./pages/DashBoard";
import Notification from "./pages/Notification";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element= {<Signup/>}/>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/leads" element={<Leads />} />
    <Route path="/notifications" element={<Notification />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/forgot" element={<ForgotPassword/>} />
    <Route path="/reset-password/:token" element={<ResetPassword/>} />

    {/* MUST BE LAST */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
