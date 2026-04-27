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
          {links.map((item) => {
            const key = item.key || item.href || item.label;
            const className = item.active ? "active" : "";

            if (item.onClick) {
              return (
                <button key={key} type="button" className={className} onClick={item.onClick}>
                  {item.label}
                </button>
              );
            }

            return (
              <a key={key} href={item.href} className={className}>
                {item.label}
              </a>
            );
          })}
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
