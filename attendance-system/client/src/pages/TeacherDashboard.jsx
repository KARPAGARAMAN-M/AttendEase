import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import { AttendanceApi, CatalogApi, StudentApi } from "../api/services";

const ATTENDANCE_STATUS_OPTIONS = [
  { value: "Present", tone: "present" },
  { value: "Absent", tone: "absent" },
  { value: "Late", tone: "late" },
];

export default function TeacherDashboard() {
  const { token, user } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [markStudents, setMarkStudents] = useState([]);
  const [markStatus, setMarkStatus] = useState({});
  const [activeSection, setActiveSection] = useState("attendance");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  const [markForm, setMarkForm] = useState({
    department_id: "",
    year: "",
    semester: "",
    section: "",
    subject_id: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        const [departmentData, subjectData] = await Promise.all([
          CatalogApi.getDepartments(token),
          CatalogApi.getSubjects(token, { teacher_id: user.id }),
        ]);

        if (!mounted) {
          return;
        }

        setDepartments(departmentData);
        setSubjects(subjectData);
      } catch (error) {
        setMessageError(true);
        setMessage(error.message);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [token, user.id]);

  function setInfo(text, isError = false) {
    setMessage(text);
    setMessageError(isError);
  }

  function setStudentStatus(studentId, status) {
    setMarkStatus((prev) => {
      if (prev[studentId] === status) {
        return prev;
      }

      return {
        ...prev,
        [studentId]: status,
      };
    });
  }

  function setBulkStatus(status) {
    if (!markStudents.length) {
      return;
    }

    const nextStatus = {};
    markStudents.forEach((row) => {
      nextStatus[row.id] = status;
    });

    setMarkStatus(nextStatus);
    setInfo(`${markStudents.length} students marked as ${status.toLowerCase()}.`);
  }

  function handleStatusShortcut(event, studentId) {
    const key = event.key.toLowerCase();
    const shortcutMap = {
      p: "Present",
      a: "Absent",
      l: "Late",
    };

    if (!shortcutMap[key]) {
      return;
    }

    event.preventDefault();
    setStudentStatus(studentId, shortcutMap[key]);
  }

  async function loadStudentsForMarking() {
    try {
      const rows = await StudentApi.list(token, {
        department_id: markForm.department_id,
        year: markForm.year,
        semester: markForm.semester,
        section: markForm.section,
      });

      const statuses = {};
      rows.forEach((row) => {
        statuses[row.id] = "Present";
      });

      setMarkStudents(rows);
      setMarkStatus(statuses);
      setInfo(`${rows.length} students loaded.`);
    } catch (error) {
      setInfo(error.message, true);
    }
  }

  async function submitAttendance(event) {
    event.preventDefault();

    if (!markForm.subject_id) {
      setInfo("Select a subject.", true);
      return;
    }

    if (!markStudents.length) {
      setInfo("Load students before saving attendance.", true);
      return;
    }

    try {
      const payload = {
        subject_id: markForm.subject_id,
        date: markForm.date,
        entries: markStudents.map((row) => ({
          student_id: row.id,
          status: markStatus[row.id] || "Present",
        })),
      };

      const response = await AttendanceApi.mark(token, payload);
      setInfo(`${response.records} attendance entries saved. Existing date entries were updated.`);
    } catch (error) {
      setInfo(error.message, true);
    }
  }

  const filteredSubjectsForMark = useMemo(() => {
    const selectedYear = Number(markForm.year);
    return subjects.filter((row) => {
      const departmentMatches =
        !markForm.department_id || row.department_id === markForm.department_id;
      const rowYear = Number(row.year);
      const yearMatches =
        !Number.isInteger(selectedYear) || !Number.isInteger(rowYear) || rowYear === selectedYear;
      return departmentMatches && yearMatches;
    });
  }, [subjects, markForm.department_id, markForm.year]);
  const navLinks = [
    {
      key: "attendance",
      href: "#attendance",
      label: "Attendance",
      active: activeSection === "attendance",
      onClick: () => setActiveSection("attendance"),
    },
  ];

  return (
    <DashboardLayout
      heading="Teacher Dashboard"
      subtitle="Mark and update student attendance."
      links={navLinks}
    >
      <div className="card-grid">
        <section className="card" id="attendance" hidden={activeSection !== "attendance"}>
          <h3>Mark / Update Attendance</h3>
          <form onSubmit={submitAttendance}>
            <div className="form-row">
              <select
                className="form-col-3"
                value={markForm.department_id}
                onChange={(event) =>
                  setMarkForm((prev) => ({ ...prev, department_id: event.target.value }))
                }
              >
                <option value="">Department</option>
                {departments.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
              <input
                className="form-col-2"
                type="number"
                min="1"
                max="4"
                placeholder="Year"
                value={markForm.year}
                onChange={(event) =>
                  setMarkForm((prev) => ({ ...prev, year: event.target.value, subject_id: "" }))
                }
                required
              />
              <input
                className="form-col-2"
                type="number"
                min="1"
                max="8"
                placeholder="Semester"
                value={markForm.semester}
                onChange={(event) =>
                  setMarkForm((prev) => ({ ...prev, semester: event.target.value }))
                }
                required
              />
              <input
                className="form-col-2"
                placeholder="Section"
                value={markForm.section}
                onChange={(event) =>
                  setMarkForm((prev) => ({ ...prev, section: event.target.value }))
                }
                required
              />
              <select
                className="form-col-3"
                value={markForm.subject_id}
                onChange={(event) =>
                  setMarkForm((prev) => ({ ...prev, subject_id: event.target.value }))
                }
              >
                <option value="">Subject</option>
                {filteredSubjectsForMark.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
              <input
                className="form-col-3"
                type="date"
                value={markForm.date}
                onChange={(event) => setMarkForm((prev) => ({ ...prev, date: event.target.value }))}
                required
              />
              <button className="form-col-3 secondary" type="button" onClick={loadStudentsForMarking}>
                Load Students
              </button>
              <button className="form-col-3" type="submit">
                Save Attendance
              </button>
            </div>
          </form>

          <p className={`message ${messageError ? "error" : "success"}`}>{message}</p>

          <div className="attendance-bulk-actions" role="group" aria-label="Bulk attendance actions">
            <span className="bulk-label">Quick mark:</span>
            <button
              type="button"
              className="bulk-status-btn present"
              onClick={() => setBulkStatus("Present")}
              disabled={!markStudents.length}
            >
              Present All
            </button>
            <button
              type="button"
              className="bulk-status-btn absent"
              onClick={() => setBulkStatus("Absent")}
              disabled={!markStudents.length}
            >
              Absent All
            </button>
            <button
              type="button"
              className="bulk-status-btn late"
              onClick={() => setBulkStatus("Late")}
              disabled={!markStudents.length}
            >
              Late All
            </button>
          </div>
          <p className="bulk-shortcut-hint">Keyboard tip: focus a student&apos;s status and press P, A, or L.</p>

          <div className="table-wrap">
            <table className="attendance-mark-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Year/Sem</th>
                  <th>Section</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {markStudents.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.roll_no}</td>
                    <td>{row.department_name}</td>
                    <td>
                      {row.year}/{row.semester}
                    </td>
                    <td>{row.section}</td>
                    <td className="attendance-status-cell">
                      <fieldset
                        className="attendance-status-control"
                        onKeyDown={(event) => handleStatusShortcut(event, row.id)}
                      >
                        <legend className="sr-only">Attendance status for {row.name}</legend>
                        {ATTENDANCE_STATUS_OPTIONS.map((option) => {
                          const checked = (markStatus[row.id] || "Present") === option.value;

                          return (
                            <label
                              key={option.value}
                              className={`status-segment status-segment-${option.tone} ${
                                checked ? "active" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name={`attendance-status-${row.id}`}
                                value={option.value}
                                checked={checked}
                                onChange={(event) => setStudentStatus(row.id, event.target.value)}
                                aria-label={`${row.name} ${option.value}`}
                              />
                              <span>{option.value}</span>
                            </label>
                          );
                        })}
                      </fieldset>
                    </td>
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
