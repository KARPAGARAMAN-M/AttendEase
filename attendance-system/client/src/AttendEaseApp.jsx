import { useState } from "react";

const T = {
  bg: "#fafafa", white: "#ffffff", border: "#e5e7eb", text: "#111827",
  muted: "#6b7280", subtle: "#f3f4f6", teal: "#0d9488", tealBg: "#f0fdfa",
  green: "#16a34a", greenBg: "#f0fdf4", red: "#dc2626", redBg: "#fef2f2",
  amber: "#d97706", amberBg: "#fffbeb",
};

const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Mechanical Engineering",
];
const TEACHERS_DATA = [
  { name: "Priya Menon", username: "teacher.cse", email: "priya@college.edu", password: "" },
  { name: "Ravi Kumar", username: "teacher.ece", email: "ravi@college.edu", password: "" },
];
const SUBJECTS_DATA = [
  { name: "Data Structures", department: "Computer Science and Engineering", teacher: "Priya Menon" },
  { name: "Signals & Systems", department: "Electronics and Communication Engineering", teacher: "Ravi Kumar" },
];
const STUDENTS_DATA = [
  { name: "Arjun S", roll: "23CSE001", department: "Computer Science and Engineering", username: "arjun.s", email: "arjun@college.edu", year: "2", section: "A", password: "" },
  { name: "Karthik V", roll: "ECE23B001", department: "Electronics and Communication Engineering", username: "karthik.v", email: "karthik@college.edu", year: "2", section: "B", password: "" },
];
const ATTENDANCE_DATA = [
  { subject: "Data Structures", total: 3, attended: 2, absent: 1, late: 0 },
  { subject: "DBMS", total: 2, attended: 2, absent: 0, late: 0 },
];
const HISTORY_DATA = [
  { date: "2026-04-18", subject: "Data Structures", status: "Present" },
  { date: "2026-04-17", subject: "DBMS", status: "Present" },
  { date: "2026-04-16", subject: "Data Structures", status: "Absent" },
  { date: "2026-04-15", subject: "Data Structures", status: "Present" },
  { date: "2026-04-14", subject: "DBMS", status: "Present" },
];

function pct(a, t) { return t === 0 ? "0%" : ((a / t) * 100).toFixed(1) + "%"; }
function pctNum(a, t) { return t === 0 ? 0 : (a / t) * 100; }

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  const [f, setF] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{
        width: "100%", padding: "8px 12px", fontSize: 13,
        border: `1px solid ${f ? T.teal : T.border}`, borderRadius: 6,
        outline: "none", fontFamily: "'DM Sans', sans-serif",
        color: T.text, background: T.white, ...style,
      }}
    />
  );
}

function Select({ value, onChange, options, placeholder, style = {} }) {
  const [f, setF] = useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{
        width: "100%", padding: "8px 12px", fontSize: 13,
        border: `1px solid ${f ? T.teal : T.border}`, borderRadius: 6,
        outline: "none", fontFamily: "'DM Sans', sans-serif",
        color: value ? T.text : T.muted, background: T.white,
        appearance: "auto", ...style,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => {
        const val = typeof o === "string" ? o : o.value;
        const lab = typeof o === "string" ? o : o.label;
        return <option key={val} value={val}>{lab}</option>;
      })}
    </select>
  );
}

function Btn({ children, variant = "primary", onClick, style = {}, disabled = false }) {
  const base = {
    padding: "8px 16px", fontSize: 13, fontWeight: 500, borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
    border: "none", opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s",
  };
  const v = {
    primary: { background: T.teal, color: T.white },
    ghost: { background: "transparent", color: T.muted, border: `1px solid ${T.border}` },
    danger: { background: T.redBg, color: T.red, border: `1px solid ${T.red}33` },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v[variant], ...style }}>{children}</button>;
}

function Badge({ type, label }) {
  const m = {
    green: { bg: T.greenBg, c: T.green },
    red: { bg: T.redBg, c: T.red },
    amber: { bg: T.amberBg, c: T.amber },
  };
  const { bg, c } = m[type] || m.green;
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, background: bg, color: c,
    }}>{label}</span>
  );
}

function StatusBadge({ value, total }) {
  const p = pctNum(value, total);
  if (p >= 75) return <Badge type="green" label="Safe" />;
  return <Badge type="red" label="Below Threshold" />;
}

function AttBadge({ status }) {
  if (status === "Present") return <Badge type="green" label="Present" />;
  if (status === "Absent") return <Badge type="red" label="Absent" />;
  return <Badge type="amber" label="Late" />;
}

function DataTable({ columns, data }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 24, textAlign: "center", color: T.muted, fontSize: 13 }}>No data</div>;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: "10px 12px", fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 0.5, color: T.muted,
                textAlign: "left", borderBottom: `1px solid ${T.border}`,
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: "10px 12px", fontSize: 13, color: T.text,
                  borderBottom: `1px solid ${T.border}`,
                }}>{col.render ? col.render(row, i) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({ label, value, highlighted }) {
  return (
    <div style={{
      padding: "16px 20px", borderRadius: 8,
      background: highlighted ? T.tealBg : T.subtle,
      border: `1px solid ${highlighted ? T.teal + "33" : T.border}`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{value}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Section({ title, children, style = {} }) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: 20, ...style,
    }}>
      {title && (
        <div style={{
          paddingBottom: 12, marginBottom: 16,
          borderBottom: `1px solid ${T.border}`,
          fontSize: 14, fontWeight: 700, color: T.text,
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

function WarningBanner({ message }) {
  return (
    <div style={{
      padding: "10px 14px", background: T.amberBg,
      border: `1px solid ${T.amber}44`, borderRadius: 6,
      fontSize: 13, color: T.amber, fontWeight: 500,
    }}>⚠ {message}</div>
  );
}

function Sidebar({ userName, role, tabs, activeTab, onTabChange, onLogout }) {
  return (
    <div style={{
      width: 200, height: "100vh", background: T.white,
      borderRight: `1px solid ${T.border}`, display: "flex",
      flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 10,
    }}>
      <div style={{ padding: "20px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.teal, textTransform: "uppercase", letterSpacing: 1 }}>
          AttendEase
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 8 }}>{userName}</div>
        <div style={{ fontSize: 11, color: T.muted }}>{role}</div>
      </div>
      <nav style={{ flex: 1, padding: "0 8px" }}>
        {tabs.map(tab => {
          const active = tab.key === activeTab;
          return (
            <div key={tab.key} onClick={() => onTabChange(tab.key)} style={{
              padding: "8px 12px", fontSize: 13,
              color: active ? T.teal : T.muted,
              background: active ? T.tealBg : "transparent",
              borderLeft: active ? `2px solid ${T.teal}` : "2px solid transparent",
              borderRadius: 4, cursor: "pointer", marginBottom: 2,
              fontWeight: active ? 500 : 400,
            }}>{tab.label}</div>
          );
        })}
      </nav>
      <div style={{ padding: 16 }}>
        <Btn variant="danger" onClick={onLogout} style={{ width: "100%" }}>Logout</Btn>
      </div>
    </div>
  );
}

function DashLayout({ userName, role, tabs, activeTab, onTabChange, onLogout, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <Sidebar userName={userName} role={role} tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />
      <div style={{ marginLeft: 200, flex: 1, padding: 28 }}>{children}</div>
    </div>
  );
}

function LoginPage({ role, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const taglines = {
    Admin: "Manage the entire system",
    HOD: "Monitor department compliance",
    Teacher: "Mark and track attendance",
    Student: "View your attendance records",
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div style={{ width: 360, background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.teal, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
          AttendEase
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>{role} Login</div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 24 }}>{taglines[role]}</div>
        <div style={{ marginBottom: 12 }}>
          <Input value={username} onChange={setUsername} placeholder="Username" />
        </div>
        <div style={{ marginBottom: 20, position: "relative" }}>
          <Input value={password} onChange={setPassword} placeholder="Password" type={showPass ? "text" : "password"} />
          <span onClick={() => setShowPass(!showPass)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            cursor: "pointer", fontSize: 12, color: T.muted, userSelect: "none",
          }}>{showPass ? "Hide" : "Show"}</span>
        </div>
        <Btn onClick={() => onLogin(role)} style={{ width: "100%" }}>Sign In</Btn>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: T.muted }}>{role} access only</div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("departments");
  const [departments, setDepartments] = useState([...DEPARTMENTS]);
  const [newDept, setNewDept] = useState("");
  const [teachers, setTeachers] = useState([...TEACHERS_DATA]);
  const [tf, setTf] = useState({ username: "", password: "", name: "", email: "" });
  const [subjects, setSubjects] = useState([...SUBJECTS_DATA]);
  const [sf, setSf] = useState({ name: "", department: "", teacher: "" });
  const [students, setStudents] = useState([...STUDENTS_DATA]);
  const [stf, setStf] = useState({ username: "", password: "", name: "", roll: "", email: "", department: "", year: "", section: "" });
  const [editDeptIdx, setEditDeptIdx] = useState(null);
  const [editDeptVal, setEditDeptVal] = useState("");

  const tabs = [
    { key: "departments", label: "Departments" },
    { key: "teachers", label: "Teachers" },
    { key: "subjects", label: "Subjects" },
    { key: "students", label: "Students" },
  ];

  const addDept = () => {
    if (newDept.trim()) { setDepartments([...departments, newDept.trim()]); setNewDept(""); }
  };
  const addTeacher = () => {
    if (tf.name.trim() && tf.username.trim()) { setTeachers([...teachers, { ...tf }]); setTf({ username: "", password: "", name: "", email: "" }); }
  };
  const addSubject = () => {
    if (sf.name.trim()) { setSubjects([...subjects, { ...sf }]); setSf({ name: "", department: "", teacher: "" }); }
  };
  const addStudent = () => {
    if (stf.name.trim() && stf.roll.trim()) { setStudents([...students, { ...stf }]); setStf({ username: "", password: "", name: "", roll: "", email: "", department: "", year: "", section: "" }); }
  };

  const content = () => {
    if (tab === "departments") return (
      <Section title="Departments">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Input value={newDept} onChange={setNewDept} placeholder="Department name" style={{ flex: 1 }} />
          <Btn onClick={addDept}>Add</Btn>
        </div>
        <DataTable
          columns={[
            { key: "idx", label: "#", render: (_, i) => i + 1 },
            { key: "name", label: "Name", render: (r, i) => {
              if (editDeptIdx === i) return (
                <div style={{ display: "flex", gap: 6 }}>
                  <Input value={editDeptVal} onChange={setEditDeptVal} style={{ flex: 1 }} />
                  <Btn onClick={() => { const d = [...departments]; d[i] = editDeptVal; setDepartments(d); setEditDeptIdx(null); }} style={{ padding: "4px 10px", fontSize: 12 }}>Save</Btn>
                  <Btn variant="ghost" onClick={() => setEditDeptIdx(null)} style={{ padding: "4px 10px", fontSize: 12 }}>Cancel</Btn>
                </div>
              );
              return r;
            }},
            { key: "edit", label: "", render: (_, i) => editDeptIdx !== i && (
              <Btn variant="ghost" onClick={() => { setEditDeptIdx(i); setEditDeptVal(departments[i]); }} style={{ padding: "4px 10px", fontSize: 12 }}>Edit</Btn>
            )},
          ]}
          data={departments.map((d, i) => ({ name: d, idx: i }))}
        />
      </Section>
    );

    if (tab === "teachers") return (
      <Section title="Teachers">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <Input value={tf.username} onChange={v => setTf({ ...tf, username: v })} placeholder="Username" />
          <Input value={tf.password} onChange={v => setTf({ ...tf, password: v })} placeholder="Password" type="password" />
          <Input value={tf.name} onChange={v => setTf({ ...tf, name: v })} placeholder="Full Name" />
          <Input value={tf.email} onChange={v => setTf({ ...tf, email: v })} placeholder="Email" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Btn onClick={addTeacher}>Add Teacher</Btn>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "username", label: "Username" },
            { key: "email", label: "Email" },
            { key: "edit", label: "", render: () => <Btn variant="ghost" style={{ padding: "4px 10px", fontSize: 12 }}>Edit</Btn> },
          ]}
          data={teachers}
        />
      </Section>
    );

    if (tab === "subjects") return (
      <Section title="Subjects">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Input value={sf.name} onChange={v => setSf({ ...sf, name: v })} placeholder="Subject name" style={{ flex: 1, minWidth: 160 }} />
          <Select value={sf.department} onChange={v => setSf({ ...sf, department: v })} options={departments} placeholder="Department" style={{ flex: 1, minWidth: 160 }} />
          <Select value={sf.teacher} onChange={v => setSf({ ...sf, teacher: v })} options={teachers.map(t => t.name)} placeholder="Teacher" style={{ flex: 1, minWidth: 140 }} />
          <Btn onClick={addSubject}>Add</Btn>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Subject" },
            { key: "department", label: "Department" },
            { key: "teacher", label: "Teacher" },
            { key: "edit", label: "", render: () => <Btn variant="ghost" style={{ padding: "4px 10px", fontSize: 12 }}>Edit</Btn> },
          ]}
          data={subjects}
        />
      </Section>
    );

    if (tab === "students") return (
      <Section title="Students">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          <Input value={stf.username} onChange={v => setStf({ ...stf, username: v })} placeholder="Username" />
          <Input value={stf.password} onChange={v => setStf({ ...stf, password: v })} placeholder="Password" type="password" />
          <Input value={stf.name} onChange={v => setStf({ ...stf, name: v })} placeholder="Full Name" />
          <Input value={stf.roll} onChange={v => setStf({ ...stf, roll: v })} placeholder="Roll No" />
          <Input value={stf.email} onChange={v => setStf({ ...stf, email: v })} placeholder="Email" />
          <Select value={stf.department} onChange={v => setStf({ ...stf, department: v })} options={departments} placeholder="Department" />
          <Input value={stf.year} onChange={v => setStf({ ...stf, year: v })} placeholder="Year" />
          <Input value={stf.section} onChange={v => setStf({ ...stf, section: v })} placeholder="Section" />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Btn onClick={addStudent}>Add Student</Btn>
          <Btn variant="ghost" onClick={() => setStf({ username: "", password: "", name: "", roll: "", email: "", department: "", year: "", section: "" })}>Reset</Btn>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "roll", label: "Roll No" },
            { key: "department", label: "Dept" },
            { key: "year", label: "Year" },
            { key: "section", label: "Section" },
            { key: "edit", label: "", render: () => <Btn variant="ghost" style={{ padding: "4px 10px", fontSize: 12 }}>Edit</Btn> },
          ]}
          data={students}
        />
      </Section>
    );
  };

  return (
    <DashLayout userName="Super Admin" role="Administrator" tabs={tabs} activeTab={tab} onTabChange={setTab} onLogout={onLogout}>
      {content()}
    </DashLayout>
  );
}

function HodDashboard({ onLogout }) {
  const [tab, setTab] = useState("report");
  const [dept, setDept] = useState("");
  const [month, setMonth] = useState("");
  const [threshold, setThreshold] = useState("75");
  const [reportData, setReportData] = useState([]);
  const [alertData, setAlertData] = useState([]);

  const tabs = [
    { key: "report", label: "Dept Report" },
    { key: "summary", label: "Subject Summary" },
    { key: "below75", label: "Below 75%" },
  ];

  const loadReport = () => {
    setReportData([
      { department: "Computer Science and Engineering", yearSem: "2 / Sem 3", section: "A", subject: "Data Structures", total: 30, attended: 24, pct: "80.0%" },
      { department: "Electronics and Communication Engineering", yearSem: "2 / Sem 3", section: "B", subject: "Signals & Systems", total: 28, attended: 18, pct: "64.3%" },
    ]);
  };

  const loadAlerts = () => {
    setAlertData([
      { student: "Karthik V", roll: "ECE23B001", department: "Electronics and Communication Engineering", total: 28, attended: 18, pct: "64.3%", status: "below" },
    ]);
  };

  const content = () => {
    if (tab === "report") return (
      <Section title="Department Report">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Select value={dept} onChange={setDept} options={DEPARTMENTS} placeholder="Select department" style={{ flex: 1 }} />
          <Input value={month} onChange={setMonth} placeholder="Month" type="month" style={{ flex: 1 }} />
          <Btn onClick={loadReport}>Load</Btn>
        </div>
        <DataTable
          columns={[
            { key: "department", label: "Department" },
            { key: "yearSem", label: "Year/Sem" },
            { key: "section", label: "Section" },
            { key: "subject", label: "Subject" },
            { key: "total", label: "Total" },
            { key: "attended", label: "Attended" },
            { key: "pct", label: "%" },
          ]}
          data={reportData}
        />
      </Section>
    );

    if (tab === "summary") return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section title="Subject-wise Summary">
          <DataTable
            columns={[
              { key: "subject", label: "Subject" },
              { key: "total", label: "Total" },
              { key: "attended", label: "Attended" },
              { key: "pct", label: "%" },
            ]}
            data={[
              { subject: "Data Structures", total: 30, attended: 24, pct: "80.0%" },
              { subject: "Signals & Systems", total: 28, attended: 18, pct: "64.3%" },
            ]}
          />
        </Section>
        <Section title="Semester-wise Summary">
          <DataTable
            columns={[
              { key: "yearSem", label: "Year/Sem" },
              { key: "total", label: "Total" },
              { key: "attended", label: "Attended" },
              { key: "pct", label: "%" },
            ]}
            data={[
              { yearSem: "2 / Sem 3", total: 58, attended: 42, pct: "72.4%" },
            ]}
          />
        </Section>
      </div>
    );

    if (tab === "below75") return (
      <Section title="Students Below Threshold">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <Input value={threshold} onChange={setThreshold} placeholder="Threshold %" type="number" style={{ width: 100 }} />
          <Btn onClick={loadAlerts}>Load Alerts</Btn>
          <Btn variant="ghost">Export PDF</Btn>
          <Btn variant="ghost">Export Excel</Btn>
        </div>
        {alertData.length > 0 && (
          <div style={{ marginBottom: 12, fontSize: 13, color: T.text }}>
            {alertData.length} student{alertData.length !== 1 ? "s" : ""} found below {threshold}%.
          </div>
        )}
        <DataTable
          columns={[
            { key: "student", label: "Student" },
            { key: "roll", label: "Roll No" },
            { key: "department", label: "Department" },
            { key: "total", label: "Total" },
            { key: "attended", label: "Attended" },
            { key: "pct", label: "%" },
            { key: "status", label: "Status", render: r => <Badge type="red" label="Below Threshold" /> },
          ]}
          data={alertData}
        />
      </Section>
    );
  };

  return (
    <DashLayout userName="Dr. Ramesh" role="HOD" tabs={tabs} activeTab={tab} onTabChange={setTab} onLogout={onLogout}>
      {content()}
    </DashLayout>
  );
}

function TeacherDashboard({ onLogout }) {
  const [tab, setTab] = useState("mark");
  const [filters, setFilters] = useState({ department: "", year: "", semester: "", section: "", subject: "" });
  const [date, setDate] = useState("");
  const [markStudents, setMarkStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [studentSel, setStudentSel] = useState("");
  const [subjectSel, setSubjectSel] = useState("");
  const [studentReport, setStudentReport] = useState(null);
  const [monthDept, setMonthDept] = useState("");
  const [monthMonth, setMonthMonth] = useState("");
  const [monthData, setMonthData] = useState([]);
  const [alertDept, setAlertDept] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("75");
  const [alertData, setAlertData] = useState([]);

  const tabs = [
    { key: "mark", label: "Mark Attendance" },
    { key: "studentReport", label: "Student Report" },
    { key: "monthly", label: "Monthly Report" },
    { key: "alerts", label: "Alerts" },
  ];

  const loadStudents = () => {
    const s = STUDENTS_DATA.map((st, i) => ({ ...st, id: i }));
    setMarkStudents(s);
    const m = {};
    s.forEach(st => { m[st.id] = "P"; });
    setMarks(m);
  };

  const loadStudentReport = () => {
    setStudentReport({
      total: ATTENDANCE_DATA.reduce((a, r) => a + r.total, 0),
      attended: ATTENDANCE_DATA.reduce((a, r) => a + r.attended, 0),
      subjects: ATTENDANCE_DATA,
    });
  };

  const loadMonthly = () => {
    setMonthData([
      { department: "Computer Science and Engineering", yearSem: "2 / Sem 3", section: "A", subject: "Data Structures", total: 30, attended: 24, pct: "80.0%" },
    ]);
  };

  const loadAlerts = () => {
    setAlertData([
      { student: "Karthik V", roll: "ECE23B001", department: "Electronics and Communication Engineering", total: 28, attended: 18, pct: "64.3%", status: "below" },
    ]);
  };

  const belowCount = markStudents.filter(s => {
    const att = ATTENDANCE_DATA.find(a => true);
    return att && pctNum(att.attended, att.total) < 75;
  }).length;

  const markBtn = (sid, val) => {
    const map = {
      P: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      A: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
      L: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    };
    const active = marks[sid] === val;
    const s = map[val];
    return (
      <button
        onClick={() => setMarks({ ...marks, [sid]: val })}
        style={{
          padding: "3px 9px", borderRadius: 5, fontSize: 12, fontWeight: 700,
          border: `1px solid ${active ? s.border : T.border}`,
          background: active ? s.bg : T.white,
          color: active ? s.color : T.muted,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          marginRight: 4,
        }}
      >{val}</button>
    );
  };

  const content = () => {
    if (tab === "mark") return (
      <Section title="Mark Attendance">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <Select value={filters.department} onChange={v => setFilters({ ...filters, department: v })} options={DEPARTMENTS} placeholder="Department" />
          <Input value={filters.year} onChange={v => setFilters({ ...filters, year: v })} placeholder="Year" />
          <Input value={filters.semester} onChange={v => setFilters({ ...filters, semester: v })} placeholder="Semester" />
          <Input value={filters.section} onChange={v => setFilters({ ...filters, section: v })} placeholder="Section" />
          <Select value={filters.subject} onChange={v => setFilters({ ...filters, subject: v })} options={SUBJECTS_DATA.map(s => s.name)} placeholder="Subject" />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <Input value={date} onChange={setDate} type="date" style={{ width: 170 }} />
          <Btn onClick={loadStudents}>Load Students</Btn>
          <Btn variant="ghost" disabled={markStudents.length === 0}>Submit Attendance</Btn>
        </div>
        {markStudents.length > 0 && belowCount > 0 && (
          <div style={{ marginBottom: 12 }}>
            <WarningBanner message={`${belowCount} students below threshold.`} />
          </div>
        )}
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "roll", label: "Roll No" },
            { key: "department", label: "Dept" },
            { key: "yearSem", label: "Year/Sem", render: r => `${r.year} / Sem 3` },
            { key: "section", label: "Section" },
            { key: "mark", label: "Mark", render: r => (
              <div style={{ display: "flex" }}>
                {markBtn(r.id, "P")}
                {markBtn(r.id, "A")}
                {markBtn(r.id, "L")}
              </div>
            )},
          ]}
          data={markStudents}
        />
      </Section>
    );

    if (tab === "studentReport") return (
      <Section title="Student Report">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Select value={studentSel} onChange={setStudentSel} options={STUDENTS_DATA.map(s => ({ value: s.name, label: `${s.name} (${s.roll})` }))} placeholder="Select student" style={{ flex: 1 }} />
          <Select value={subjectSel} onChange={setSubjectSel} options={[{ value: "", label: "All Subjects" }, ...SUBJECTS_DATA.map(s => ({ value: s.name, label: s.name }))]} placeholder="Subject" style={{ flex: 1 }} />
          <Btn onClick={loadStudentReport}>Load</Btn>
        </div>
        {studentReport && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <StatBox label="Total Classes" value={studentReport.total} />
              <StatBox label="Attended" value={studentReport.attended} />
              <StatBox label="Attendance %" value={pct(studentReport.attended, studentReport.total)} highlighted />
            </div>
            <DataTable
              columns={[
                { key: "subject", label: "Subject" },
                { key: "total", label: "Total" },
                { key: "attended", label: "Attended" },
                { key: "pct", label: "%", render: r => pct(r.attended, r.total) },
              ]}
              data={studentReport.subjects}
            />
          </>
        )}
      </Section>
    );

    if (tab === "monthly") return (
      <Section title="Monthly Report">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Select value={monthDept} onChange={setMonthDept} options={DEPARTMENTS} placeholder="Department" style={{ flex: 1 }} />
          <Input value={monthMonth} onChange={setMonthMonth} type="month" style={{ flex: 1 }} />
          <Btn onClick={loadMonthly}>Load</Btn>
        </div>
        <DataTable
          columns={[
            { key: "department", label: "Department" },
            { key: "yearSem", label: "Year/Sem" },
            { key: "section", label: "Section" },
            { key: "subject", label: "Subject" },
            { key: "total", label: "Total" },
            { key: "attended", label: "Attended" },
            { key: "pct", label: "%" },
          ]}
          data={monthData}
        />
      </Section>
    );

    if (tab === "alerts") return (
      <Section title="Alerts">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <Select value={alertDept} onChange={setAlertDept} options={DEPARTMENTS} placeholder="Department" style={{ flex: 1 }} />
          <Input value={alertThreshold} onChange={setAlertThreshold} type="number" placeholder="Threshold" style={{ width: 100 }} />
          <Btn onClick={loadAlerts}>Load</Btn>
          <Btn variant="ghost">Export PDF</Btn>
          <Btn variant="ghost">Export Excel</Btn>
        </div>
        <DataTable
          columns={[
            { key: "student", label: "Student" },
            { key: "roll", label: "Roll No" },
            { key: "department", label: "Dept" },
            { key: "total", label: "Total" },
            { key: "attended", label: "Attended" },
            { key: "pct", label: "%" },
            { key: "status", label: "Status", render: () => <Badge type="red" label="Below Threshold" /> },
          ]}
          data={alertData}
        />
      </Section>
    );
  };

  return (
    <DashLayout userName="Priya Menon" role="Teacher" tabs={tabs} activeTab={tab} onTabChange={setTab} onLogout={onLogout}>
      {content()}
    </DashLayout>
  );
}

function StudentDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const total = ATTENDANCE_DATA.reduce((a, r) => a + r.total, 0);
  const attended = ATTENDANCE_DATA.reduce((a, r) => a + r.attended, 0);
  const percentage = pctNum(attended, total);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "subject", label: "Subject Attendance" },
    { key: "history", label: "History" },
  ];

  const content = () => {
    if (tab === "overview") return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <StatBox label="Total Classes" value={total} />
          <StatBox label="Attended" value={attended} />
          <StatBox label="Attendance %" value={pct(attended, total)} highlighted />
        </div>
        {percentage < 75 && (
          <div style={{ marginBottom: 16 }}>
            <WarningBanner message={`Your attendance is ${pct(attended, total)} — below the 75% minimum requirement.`} />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Section title="Subject Summary">
            <DataTable
              columns={[
                { key: "subject", label: "Subject" },
                { key: "total", label: "Total" },
                { key: "attended", label: "Attended" },
                { key: "pct", label: "%", render: r => pct(r.attended, r.total) },
                { key: "status", label: "Status", render: r => <StatusBadge value={r.attended} total={r.total} /> },
              ]}
              data={ATTENDANCE_DATA}
            />
          </Section>
          <Section title="Recent History">
            <DataTable
              columns={[
                { key: "date", label: "Date" },
                { key: "subject", label: "Subject" },
                { key: "status", label: "Status", render: r => <AttBadge status={r.status} /> },
              ]}
              data={HISTORY_DATA.slice(0, 5)}
            />
          </Section>
        </div>
      </>
    );

    if (tab === "subject") return (
      <Section title="Subject Attendance">
        <DataTable
          columns={[
            { key: "subject", label: "Subject" },
            { key: "total", label: "Total" },
            { key: "attended", label: "Attended" },
            { key: "absent", label: "Absent" },
            { key: "late", label: "Late" },
            { key: "pct", label: "%", render: r => pct(r.attended, r.total) },
            { key: "status", label: "Status", render: r => <StatusBadge value={r.attended} total={r.total} /> },
          ]}
          data={ATTENDANCE_DATA}
        />
      </Section>
    );

    if (tab === "history") return (
      <Section title="Attendance History">
        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "subject", label: "Subject" },
            { key: "status", label: "Status", render: r => <AttBadge status={r.status} /> },
          ]}
          data={HISTORY_DATA}
        />
      </Section>
    );
  };

  return (
    <DashLayout userName="Arjun S" role="Student" tabs={tabs} activeTab={tab} onTabChange={setTab} onLogout={onLogout}>
      {content()}
    </DashLayout>
  );
}

function DemoSwitcher({ screen, onSwitch }) {
  const items = [
    { key: "admin-login", label: "Admin ↗" },
    { key: "admin-dash", label: "Admin ▪" },
    { key: "hod-login", label: "HOD ↗" },
    { key: "hod-dash", label: "HOD ▪" },
    { key: "teacher-login", label: "Teacher ↗" },
    { key: "teacher-dash", label: "Teacher ▪" },
    { key: "student-login", label: "Student ↗" },
    { key: "student-dash", label: "Student ▪" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
      background: "#111827", borderRadius: 99, padding: "4px 6px",
      display: "flex", gap: 2, zIndex: 999,
    }}>
      {items.map(it => {
        const active = screen === it.key;
        return (
          <button key={it.key} onClick={() => onSwitch(it.key)} style={{
            padding: "5px 10px", fontSize: 11, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            background: active ? T.teal : "transparent",
            color: active ? T.white : "#6b7280",
            border: "none", borderRadius: 99, cursor: "pointer",
            whiteSpace: "nowrap",
          }}>{it.label}</button>
        );
      })}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("admin-login");

  const handleLogin = (role) => {
    setScreen(`${role.toLowerCase()}-dash`);
  };
  const handleLogout = (role) => {
    setScreen(`${role.toLowerCase()}-login`);
  };

  let view = null;
  switch (screen) {
    case "admin-login":
      view = <LoginPage role="Admin" onLogin={handleLogin} />;
      break;
    case "admin-dash":
      view = <AdminDashboard onLogout={() => handleLogout("Admin")} />;
      break;
    case "hod-login":
      view = <LoginPage role="HOD" onLogin={handleLogin} />;
      break;
    case "hod-dash":
      view = <HodDashboard onLogout={() => handleLogout("HOD")} />;
      break;
    case "teacher-login":
      view = <LoginPage role="Teacher" onLogin={handleLogin} />;
      break;
    case "teacher-dash":
      view = <TeacherDashboard onLogout={() => handleLogout("Teacher")} />;
      break;
    case "student-login":
      view = <LoginPage role="Student" onLogin={handleLogin} />;
      break;
    case "student-dash":
      view = <StudentDashboard onLogout={() => handleLogout("Student")} />;
      break;
    default:
      view = <LoginPage role="Admin" onLogin={handleLogin} />;
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');*{margin:0;padding:0;box-sizing:border-box;font-family:'DM Sans',sans-serif;}body{background:${T.bg};}`}</style>
      {view}
      <DemoSwitcher screen={screen} onSwitch={setScreen} />
    </>
  );
}
