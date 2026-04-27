import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import { CatalogApi, ScheduleApi, StudentApi } from "../api/services";

const emptyTeacherForm = { username: "", password: "", name: "", email: "" };
const emptySubjectForm = { name: "", year: "", teacher_id: "" };
const emptyStudentForm = {
  username: "",
  password: "",
  name: "",
  roll_no: "",
  email: "",
  year: "",
  semester: "",
  section: "",
};
const emptyScheduleForm = {
  year: "",
  semester: "",
  section: "",
  day_of_week: "1",
  start_time: "",
  end_time: "",
  subject_id: "",
  teacher_id: "",
  room: "",
  academic_year: "",
  active: true,
};

const dayLabel = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export default function AdminDashboard() {
  const { token } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [editingStudentId, setEditingStudentId] = useState("");

  const [messages, setMessages] = useState({
    teacher: "",
    subject: "",
    student: "",
    schedule: "",
  });
  const [errors, setErrors] = useState({
    teacher: false,
    subject: false,
    student: false,
    schedule: false,
  });

  const cseDepartmentId = departments[0]?.id || "";
  const cseDepartmentName = departments[0]?.name || "Computer Science and Engineering";

  const teacherOptions = useMemo(
    () => teachers.map((item) => ({ value: item.id, label: item.name })),
    [teachers],
  );
  const subjectOptions = useMemo(
    () =>
      subjects.map((item) => ({
        value: item.id,
        label: item.year ? `${item.name} (Year ${item.year})` : item.name,
        year: item.year || null,
      })),
    [subjects],
  );
  const scheduleSubjectOptions = useMemo(() => {
    const selectedYear = Number(scheduleForm.year);
    if (!Number.isInteger(selectedYear)) {
      return subjectOptions;
    }

    return subjectOptions.filter((item) => !Number.isInteger(item.year) || item.year === selectedYear);
  }, [subjectOptions, scheduleForm.year]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        await refreshAll(mounted);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function refreshAll(mounted = true) {
    const [departmentsData, teachersData, subjectsData, studentsData, schedulesData] =
      await Promise.all([
        CatalogApi.getDepartments(token),
        CatalogApi.getTeachers(token),
        CatalogApi.getSubjects(token),
        StudentApi.list(token),
        ScheduleApi.list(token),
      ]);

    if (!mounted) {
      return;
    }
    setDepartments(departmentsData);
    setTeachers(teachersData);
    setSubjects(subjectsData);
    setStudents(studentsData);
    setSchedules(schedulesData);
  }

  function setSectionMessage(section, message, isError = false) {
    setMessages((prev) => ({ ...prev, [section]: message }));
    setErrors((prev) => ({ ...prev, [section]: isError }));
  }

  async function submitTeacher(event) {
    event.preventDefault();
    try {
      await CatalogApi.createTeacher(token, teacherForm);
      setTeacherForm(emptyTeacherForm);
      setSectionMessage("teacher", "Teacher created successfully.");
      await refreshAll();
    } catch (error) {
      setSectionMessage("teacher", error.message, true);
    }
  }

  async function submitSubject(event) {
    event.preventDefault();
    if (!cseDepartmentId) {
      setSectionMessage("subject", "CSE department is not ready yet. Try again.", true);
      return;
    }

    try {
      await CatalogApi.createSubject(token, {
        name: subjectForm.name.trim(),
        year: Number(subjectForm.year),
        department_id: cseDepartmentId,
        teacher_id: subjectForm.teacher_id,
      });
      setSubjectForm(emptySubjectForm);
      setSectionMessage("subject", "Subject created successfully.");
      await refreshAll();
    } catch (error) {
      setSectionMessage("subject", error.message, true);
    }
  }

  async function submitStudent(event) {
    event.preventDefault();
    if (!cseDepartmentId) {
      setSectionMessage("student", "CSE department is not ready yet. Try again.", true);
      return;
    }

    const payload = {
      username: studentForm.username.trim(),
      name: studentForm.name.trim(),
      email: studentForm.email.trim(),
      roll_no: studentForm.roll_no.trim(),
      department_id: cseDepartmentId,
      year: Number(studentForm.year),
      semester: Number(studentForm.semester),
      section: studentForm.section.trim(),
    };

    if (editingStudentId) {
      if (studentForm.password.trim()) {
        payload.password = studentForm.password;
      }
      try {
        await StudentApi.update(token, editingStudentId, payload);
        setSectionMessage("student", "Student updated successfully.");
        resetStudentForm();
        await refreshAll();
      } catch (error) {
        setSectionMessage("student", error.message, true);
      }
      return;
    }

    payload.password = studentForm.password;

    try {
      await StudentApi.create(token, payload);
      setSectionMessage("student", "Student created successfully.");
      resetStudentForm();
      await refreshAll();
    } catch (error) {
      setSectionMessage("student", error.message, true);
    }
  }

  async function submitSchedule(event) {
    event.preventDefault();
    try {
      await ScheduleApi.create(token, {
        year: Number(scheduleForm.year),
        semester: Number(scheduleForm.semester),
        section: scheduleForm.section.trim(),
        day_of_week: Number(scheduleForm.day_of_week),
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        subject_id: scheduleForm.subject_id,
        teacher_id: scheduleForm.teacher_id,
        room: scheduleForm.room.trim(),
        academic_year: scheduleForm.academic_year.trim(),
        active: Boolean(scheduleForm.active),
      });
      setScheduleForm(emptyScheduleForm);
      setSectionMessage("schedule", "Schedule created successfully.");
      await refreshAll();
    } catch (error) {
      setSectionMessage("schedule", error.message, true);
    }
  }

  function startEditStudent(row) {
    setEditingStudentId(row.id);
    setStudentForm({
      username: row.username,
      password: "",
      name: row.name,
      roll_no: row.roll_no,
      email: row.email,
      year: String(row.year),
      semester: String(row.semester),
      section: row.section,
    });
  }

  async function deleteStudent(id) {
    if (!window.confirm("Delete this student account?")) {
      return;
    }
    try {
      await StudentApi.remove(token, id);
      setSectionMessage("student", "Student deleted successfully.");
      await refreshAll();
    } catch (error) {
      setSectionMessage("student", error.message, true);
    }
  }

  async function deleteSchedule(id) {
    if (!window.confirm("Delete this schedule entry?")) {
      return;
    }
    try {
      await ScheduleApi.remove(token, id);
      setSectionMessage("schedule", "Schedule deleted successfully.");
      await refreshAll();
    } catch (error) {
      setSectionMessage("schedule", error.message, true);
    }
  }

  async function deleteSubject(id) {
    if (!window.confirm("Delete this subject?")) {
      return;
    }
    try {
      await CatalogApi.removeSubject(token, id);
      setSectionMessage("subject", "Subject deleted successfully.");
      await refreshAll();
    } catch (error) {
      setSectionMessage("subject", error.message, true);
    }
  }

  function resetStudentForm() {
    setEditingStudentId("");
    setStudentForm(emptyStudentForm);
  }

  const navLinks = [
    {
      key: "overview",
      href: "#overview",
      label: "Department",
      active: activeSection === "overview",
      onClick: () => setActiveSection("overview"),
    },
    {
      key: "teachers",
      href: "#teachers",
      label: "Teachers",
      active: activeSection === "teachers",
      onClick: () => setActiveSection("teachers"),
    },
    {
      key: "subjects",
      href: "#subjects",
      label: "Subjects",
      active: activeSection === "subjects",
      onClick: () => setActiveSection("subjects"),
    },
    {
      key: "students",
      href: "#students",
      label: "Students",
      active: activeSection === "students",
      onClick: () => setActiveSection("students"),
    },
    {
      key: "schedules",
      href: "#schedules",
      label: "Schedules",
      active: activeSection === "schedules",
      onClick: () => setActiveSection("schedules"),
    },
  ];

  return (
    <DashboardLayout
      heading="Admin Dashboard (CSE)"
      subtitle="Manage users, departments, and system data."
      links={navLinks}
    >
      {loading ? <p>Loading data...</p> : null}
      <div className="card-grid">
        <section
          className={activeSection === "overview" ? "card" : "card card-half"}
          id="overview"
          hidden={activeSection !== "overview"}
        >
          <h3>Department Configuration</h3>
          <p className="message">Department scope is locked to CSE-only mode.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{cseDepartmentName}</td>
                  <td>
                    <span className="badge status-present">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          className={activeSection === "teachers" ? "card" : "card card-half"}
          id="teachers"
          hidden={activeSection !== "teachers"}
        >
          <h3>Teachers</h3>
          <form
            onSubmit={submitTeacher}
            onChange={(event) =>
              setTeacherForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
            }
          >
            <div className="form-row">
              <input
                className="form-col-4"
                name="username"
                value={teacherForm.username}
                placeholder="Username"
                required
              />
              <input
                className="form-col-4"
                name="password"
                value={teacherForm.password}
                type="password"
                placeholder="Password"
                required
              />
              <input className="form-col-4" name="name" value={teacherForm.name} placeholder="Name" required />
              <input
                className="form-col-8"
                name="email"
                value={teacherForm.email}
                type="email"
                placeholder="Email"
                required
              />
              <button className="form-col-4" type="submit">
                Add Teacher
              </button>
            </div>
          </form>
          <p className={`message ${errors.teacher ? "error" : "success"}`}>{messages.teacher}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.username}</td>
                    <td>{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className={activeSection === "subjects" ? "card" : "card card-half"}
          id="subjects"
          hidden={activeSection !== "subjects"}
        >
          <h3>Subjects (CSE)</h3>
          <form
            onSubmit={submitSubject}
            onChange={(event) =>
              setSubjectForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
            }
          >
            <div className="form-row">
              <input className="form-col-4" name="name" value={subjectForm.name} placeholder="Subject name" required />
              <select className="form-col-2" name="year" value={subjectForm.year} required>
                <option value="">Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
              <select className="form-col-3" name="teacher_id" value={subjectForm.teacher_id} required>
                <option value="">Select Teacher</option>
                {teacherOptions.map((row) => (
                  <option key={row.value} value={row.value}>
                    {row.label}
                  </option>
                ))}
              </select>
              <button className="form-col-3" type="submit">
                Add Subject
              </button>
            </div>
          </form>
          <p className={`message ${errors.subject ? "error" : "success"}`}>{messages.subject}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Year</th>
                  <th>Department</th>
                  <th>Teacher</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.year || "-"}</td>
                    <td>{row.department_name}</td>
                    <td>{row.teacher_name || "Unassigned"}</td>
                    <td>
                      <button className="danger" type="button" onClick={() => deleteSubject(row.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className={activeSection === "students" ? "card" : "card card-half"}
          id="students"
          hidden={activeSection !== "students"}
        >
          <h3>Students (CSE)</h3>
          <form
            onSubmit={submitStudent}
            onChange={(event) =>
              setStudentForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
            }
          >
            <div className="form-row">
              <input className="form-col-3" name="username" value={studentForm.username} placeholder="Username" required />
              <input
                className="form-col-3"
                name="password"
                value={studentForm.password}
                type="password"
                placeholder={editingStudentId ? "Password (optional)" : "Password"}
                required={!editingStudentId}
              />
              <input className="form-col-3" name="name" value={studentForm.name} placeholder="Name" required />
              <input className="form-col-3" name="roll_no" value={studentForm.roll_no} placeholder="Roll No" required />
              <input className="form-col-6" name="email" value={studentForm.email} type="email" placeholder="Email" required />
              <input className="form-col-2" name="year" value={studentForm.year} type="number" min="1" max="4" placeholder="Year" required />
              <input
                className="form-col-2"
                name="semester"
                value={studentForm.semester}
                type="number"
                min="1"
                max="8"
                placeholder="Sem"
                required
              />
              <input className="form-col-2" name="section" value={studentForm.section} placeholder="Section" required />
              <button className="form-col-2" type="submit">
                {editingStudentId ? "Update" : "Add"}
              </button>
            </div>
          </form>
          <div className="button-row" style={{ marginTop: "0.5rem" }}>
            <button className="light" type="button" onClick={resetStudentForm}>
              Reset Form
            </button>
          </div>
          <p className={`message ${errors.student ? "error" : "success"}`}>{messages.student}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Year/Sem</th>
                  <th>Section</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.roll_no}</td>
                    <td>{row.department_name}</td>
                    <td>
                      {row.year}/{row.semester}
                    </td>
                    <td>{row.section}</td>
                    <td>{row.email}</td>
                    <td>
                      <div className="button-row">
                        <button className="light" type="button" onClick={() => startEditStudent(row)}>
                          Edit
                        </button>
                        <button className="danger" type="button" onClick={() => deleteStudent(row.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" id="schedules" hidden={activeSection !== "schedules"}>
          <h3>Academic Schedule (CSE)</h3>
          <form onSubmit={submitSchedule}>
            <div className="form-row">
              <input
                className="form-col-2"
                type="number"
                min="1"
                max="4"
                placeholder="Year"
                value={scheduleForm.year}
                onChange={(event) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    year: event.target.value,
                    subject_id: "",
                  }))
                }
                required
              />
              <input
                className="form-col-2"
                type="number"
                min="1"
                max="8"
                placeholder="Semester"
                value={scheduleForm.semester}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, semester: event.target.value }))}
                required
              />
              <input
                className="form-col-2"
                placeholder="Section"
                value={scheduleForm.section}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, section: event.target.value }))}
                required
              />
              <select
                className="form-col-2"
                value={scheduleForm.day_of_week}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, day_of_week: event.target.value }))}
              >
                {Object.entries(dayLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                className="form-col-2"
                type="time"
                value={scheduleForm.start_time}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, start_time: event.target.value }))}
                required
              />
              <input
                className="form-col-2"
                type="time"
                value={scheduleForm.end_time}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, end_time: event.target.value }))}
                required
              />
              <select
                className="form-col-3"
                value={scheduleForm.subject_id}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, subject_id: event.target.value }))}
                required
              >
                <option value="">Select Subject</option>
                {scheduleSubjectOptions.map((row) => (
                  <option key={row.value} value={row.value}>
                    {row.label}
                  </option>
                ))}
              </select>
              <select
                className="form-col-3"
                value={scheduleForm.teacher_id}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, teacher_id: event.target.value }))}
                required
              >
                <option value="">Select Teacher</option>
                {teacherOptions.map((row) => (
                  <option key={row.value} value={row.value}>
                    {row.label}
                  </option>
                ))}
              </select>
              <input
                className="form-col-2"
                placeholder="Room"
                value={scheduleForm.room}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, room: event.target.value }))}
                required
              />
              <input
                className="form-col-2"
                placeholder="Academic Year (e.g. 2026-27)"
                value={scheduleForm.academic_year}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, academic_year: event.target.value }))}
                required
              />
              <select
                className="form-col-2"
                value={String(scheduleForm.active)}
                onChange={(event) =>
                  setScheduleForm((prev) => ({ ...prev, active: event.target.value === "true" }))
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <button className="form-col-2" type="submit">
                Add Schedule
              </button>
            </div>
          </form>
          <p className={`message ${errors.schedule ? "error" : "success"}`}>{messages.schedule}</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Room</th>
                  <th>Academic Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.year}/{row.semester} - {row.section}
                    </td>
                    <td>{dayLabel[row.day_of_week] || row.day_of_week}</td>
                    <td>
                      {row.start_time} - {row.end_time}
                    </td>
                    <td>{row.subject_name}</td>
                    <td>{row.teacher_name}</td>
                    <td>{row.room}</td>
                    <td>{row.academic_year}</td>
                    <td>
                      {row.active ? (
                        <span className="badge status-present">Active</span>
                      ) : (
                        <span className="badge status-absent">Inactive</span>
                      )}
                    </td>
                    <td>
                      <button className="danger" type="button" onClick={() => deleteSchedule(row.id)}>
                        Delete
                      </button>
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
