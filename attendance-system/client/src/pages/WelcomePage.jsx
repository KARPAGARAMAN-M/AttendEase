import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  function selectRole(roleParam) {
    logout();
    navigate(`/login?role=${roleParam}`, { replace: true });
  }

  return (
    <div className={`welcome-wrapper ${loaded ? "welcome-loaded" : ""}`}>
      {/* ── Top Navigation Bar ── */}
      <nav className="welcome-navbar" id="main-nav">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <img
              src="/tkec-logo.jpeg"
              alt="The Kavery Engineering College Logo"
              className="navbar-logo"
              id="navbar-logo"
            />
            <div className="navbar-college-info">
              <span className="navbar-college-name">The Kavery Engineering College</span>
              <span className="navbar-college-tag">(Autonomous), Mecheri</span>
            </div>
          </div>
          <div className="navbar-right">
            <span className="navbar-portal-label">AttendEase Portal</span>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="welcome-hero" id="hero-section">
        <div className="hero-bg-pattern" aria-hidden="true"></div>

        <div className="hero-logo-block">
          <div className="hero-logo-ring">
            <img
              src="/tkec-logo.jpeg"
              alt="The Kavery Engineering College Emblem"
              className="hero-logo"
              id="hero-logo"
            />
          </div>
        </div>

        <div className="hero-text-block">
          <p className="hero-institution-label">The Kavery Engineering College (Autonomous), Mecheri</p>
          <h1 className="hero-title" id="hero-title">
            College Attendance<br />Management System
          </h1>
          <p className="hero-subtitle">
            Streamlined attendance tracking, reporting, and compliance management
            for a modern academic institution.
          </p>
          <div className="hero-motto">
            <span className="motto-icon">✦</span>
            <span>Creativity &bull; Success &bull; Excellence</span>
          </div>
        </div>
      </section>

      {/* ── Role Selection ── */}
      <section className="welcome-roles-section" id="role-selection">
        <p className="roles-heading-label">Select your role to sign in</p>
        <div className="welcome-user-grid">
          {/* Admin */}
          <button
            type="button"
            className="welcome-user-card role-admin"
            id="role-card-admin"
            onClick={() => selectRole("Admin")}
          >
            <div className="role-card-icon-wrap role-admin-bg">
              <span className="role-card-icon">🛡️</span>
            </div>
            <div className="role-card-body">
              <h2>Administrator</h2>
              <p>Manage departments, teachers, subjects, and student accounts.</p>
            </div>
            <span className="role-arrow" aria-hidden="true">→</span>
          </button>

          {/* Teacher */}
          <button
            type="button"
            className="welcome-user-card role-teacher"
            id="role-card-teacher"
            onClick={() => selectRole("Teacher")}
          >
            <div className="role-card-icon-wrap role-teacher-bg">
              <span className="role-card-icon">👩‍🏫</span>
            </div>
            <div className="role-card-body">
              <h2>Teacher / Faculty</h2>
              <p>Mark attendance and generate report exports.</p>
            </div>
            <span className="role-arrow" aria-hidden="true">→</span>
          </button>

          {/* Student */}
          <button
            type="button"
            className="welcome-user-card role-student"
            id="role-card-student"
            onClick={() => selectRole("Student")}
          >
            <div className="role-card-icon-wrap role-student-bg">
              <span className="role-card-icon">🎓</span>
            </div>
            <div className="role-card-body">
              <h2>Student Portal</h2>
              <p>View overall attendance, subject summary, and history.</p>
            </div>
            <span className="role-arrow" aria-hidden="true">→</span>
          </button>

          {/* HOD */}
          <button
            type="button"
            className="welcome-user-card role-hod"
            id="role-card-hod"
            onClick={() => selectRole("HOD%20/%20Principal")}
          >
            <div className="role-card-icon-wrap role-hod-bg">
              <span className="role-card-icon">🧑‍💼</span>
            </div>
            <div className="role-card-body">
              <h2>HOD / Principal</h2>
              <p>Monitor departmental metrics and students below threshold.</p>
            </div>
            <span className="role-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="welcome-footer" id="footer">
        <div className="footer-inner">
          <img src="/tkec-logo.jpeg" alt="" className="footer-logo" />
          <div className="footer-text">
            <p>&copy; {new Date().getFullYear()} The Kavery Engineering College (Autonomous), Mecheri.</p>
            <p className="footer-sub">Powered by AttendEase &mdash; Attendance Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
