import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { rolePath } from "../auth";

const ROLE_META = {
  ADMIN: { label: "Admin", className: "role-admin" },
  TEACHER: { label: "Teacher", className: "role-teacher" },
  STUDENT: { label: "Student", className: "role-student" },
  HOD: { label: "HOD / Principal", className: "role-hod" },
};

function normalizeRoleParam(value) {
  const role = String(value || "").trim().toUpperCase();
  if (!role) {
    return "";
  }
  if (role.includes("ADMIN")) {
    return "ADMIN";
  }
  if (role.includes("TEACHER")) {
    return "TEACHER";
  }
  if (role.includes("STUDENT")) {
    return "STUDENT";
  }
  if (role.includes("HOD") || role.includes("PRINCIPAL")) {
    return "HOD";
  }
  return "";
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRoleKey = normalizeRoleParam(searchParams.get("role"));
  const selectedRole = selectedRoleKey ? ROLE_META[selectedRoleKey] : null;
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  function clearFormState() {
    setForm({ username: "", password: "" });
    setMessage("");
    setIsError(false);
    setSubmitting(false);
  }

  function clearDomInputs() {
    if (usernameRef.current) {
      usernameRef.current.value = "";
    }
    if (passwordRef.current) {
      passwordRef.current.value = "";
    }
  }

  useEffect(() => {
    clearFormState();
    clearDomInputs();

    const t1 = setTimeout(() => {
      clearFormState();
      clearDomInputs();
    }, 0);
    const t2 = setTimeout(() => {
      clearFormState();
      clearDomInputs();
    }, 120);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedRoleKey]);

  function onUsernameChange(event) {
    setForm((prev) => ({ ...prev, username: event.target.value }));
  }

  function onPasswordChange(event) {
    setForm((prev) => ({ ...prev, password: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!selectedRoleKey) {
      setIsError(true);
      setMessage("Select a role from the welcome page before logging in.");
      return;
    }

    setSubmitting(true);
    setIsError(false);
    setMessage("Signing in...");
    try {
      const user = await login(form.username.trim(), form.password, selectedRoleKey);
      setMessage("Login successful. Redirecting...");
      navigate(rolePath(user.role), { replace: true });
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">AttendEase MERN Login</h1>
        <p className="auth-subtitle">
          {selectedRole ? `Sign in as ${selectedRole.label}.` : "Sign in with your assigned account."}
        </p>
        {selectedRole ? (
          <div className={`selected-role-banner ${selectedRole.className}`}>
            <span className="selected-role-label">Selected role</span>
            <span className="selected-role-value">{selectedRole.label}</span>
          </div>
        ) : null}

        <form key={selectedRoleKey || "no-role"} onSubmit={onSubmit} autoComplete="off">
          <input
            type="text"
            name="fake_username"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <input
            type="password"
            name="fake_password"
            autoComplete="current-password"
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <div>
            <label htmlFor="username">Username</label>
            <input
              ref={usernameRef}
              id="username"
              name="portal_username"
              type="text"
              autoComplete="off"
              required
              value={form.username}
              onChange={onUsernameChange}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              ref={passwordRef}
              id="password"
              name="portal_password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={onPasswordChange}
            />
          </div>
          <button type="submit" disabled={submitting || !selectedRoleKey}>
            {submitting ? "Signing in..." : selectedRoleKey ? "Login" : "Select Role First"}
          </button>
          <p className={`message ${isError ? "error" : "success"}`}>{message}</p>
        </form>

        <p className="message" style={{ marginTop: "0.9rem" }}>
          <Link to="/">Back to welcome page</Link>
        </p>
      </div>
    </div>
  );
}
