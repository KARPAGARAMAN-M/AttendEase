import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function DashboardLayout({ heading, subtitle, links = [], children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="page">
      <aside className="sidebar">
        <h2>AttendEase {user?.role || ""}</h2>
        <p>
          {user?.name} ({user?.role})
        </p>
        <div className="nav-links">
          {links.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button className="danger" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="topbar">
          <div>
            <h1>{heading}</h1>
            <p className="muted">{subtitle}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
