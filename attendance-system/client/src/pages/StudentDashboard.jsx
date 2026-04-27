import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import { ReportApi } from "../api/services";

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [report, setReport] = useState({
    overall: { total_classes: 0, attended_classes: 0, percentage: 0 },
    subject_summary: [],
    records: [],
  });
  const [error, setError] = useState("");

  async function loadReport() {
    try {
      const payload = await ReportApi.studentReport(token);
      setReport(payload);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadReport();
  }, [token]);

  const navLinks = [
    {
      key: "profile",
      href: "#profile",
      label: "Profile",
      active: activeSection === "profile",
      onClick: () => setActiveSection("profile"),
    },
    {
      key: "attendance",
      href: "#attendance",
      label: "Attendance %",
      active: activeSection === "attendance",
      onClick: () => setActiveSection("attendance"),
    },
  ];

  return (
    <DashboardLayout
      heading="Student Dashboard"
      subtitle="View profile and attendance percentage."
      links={navLinks}
    >
      <div className="topbar" style={{ marginTop: "-0.4rem" }}>
        <button className="light" type="button" onClick={loadReport}>
          Refresh
        </button>
      </div>
      {error ? <p className="message error">{error}</p> : null}

      <div className="card-grid">
        <section
          className={activeSection === "profile" ? "card" : "card card-half"}
          id="profile"
          hidden={activeSection !== "profile"}
        >
          <h3>My Profile</h3>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{user?.name || "-"}</td>
                </tr>
                <tr>
                  <th>Username</th>
                  <td>{user?.username || "-"}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{user?.email || "-"}</td>
                </tr>
                <tr>
                  <th>Role</th>
                  <td>{user?.role || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          className={activeSection === "attendance" ? "card" : "card card-half"}
          id="attendance"
          hidden={activeSection !== "attendance"}
        >
          <h3>Attendance Percentage</h3>
          <div className="kpi">
            <div className="kpi-item">
              <p className="kpi-label">Total Classes</p>
              <p className="kpi-value">{report.overall.total_classes || 0}</p>
            </div>
            <div className="kpi-item">
              <p className="kpi-label">Attended Classes</p>
              <p className="kpi-value">{report.overall.attended_classes || 0}</p>
            </div>
            <div className="kpi-item">
              <p className="kpi-label">Overall Percentage</p>
              <p className={`kpi-value ${Number(report.overall.percentage || 0) < 75 ? "warning-text" : ""}`}>
                {report.overall.percentage || 0}%
              </p>
            </div>
          </div>

          <div className="table-wrap" style={{ marginTop: "0.9rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Attended</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.subject_summary.map((row) => (
                  <tr key={row.subject_id}>
                    <td>{row.subject_name}</td>
                    <td>{row.total_classes}</td>
                    <td>{row.attended_classes}</td>
                    <td className={Number(row.percentage) < 75 ? "warning-text" : ""}>{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
