import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../AuthContext";
import { CatalogApi, ReportApi } from "../api/services";

function pctClass(value) {
  return Number(value) < 75 ? "warning-text" : "";
}

function summarize(rows, keyBuilder) {
  const map = new Map();
  rows.forEach((row) => {
    const key = keyBuilder(row);
    if (!map.has(key)) {
      map.set(key, { key, total: 0, attended: 0 });
    }
    const ref = map.get(key);
    ref.total += Number(row.total_classes || 0);
    ref.attended += Number(row.attended_classes || 0);
  });

  return Array.from(map.values()).map((row) => ({
    ...row,
    percentage: row.total ? Math.round((row.attended * 10000) / row.total) / 100 : 0,
  }));
}

export default function HodDashboard() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [filters, setFilters] = useState({
    department_id: "",
    month: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      try {
        const departmentData = await CatalogApi.getDepartments(token);
        if (!mounted) {
          return;
        }
        setDepartments(departmentData);
        await loadMonthly();
      } catch (error) {
        setMessage(error.message);
        setIsError(true);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function loadMonthly() {
    try {
      const response = await ReportApi.monthlyReport(token, {
        department_id: filters.department_id,
        month: filters.month,
      });
      setMonthlyRows(response.rows || []);
      setMessage("Overall attendance report loaded.");
      setIsError(false);
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    }
  }

  const subjectSummary = useMemo(() => summarize(monthlyRows, (row) => row.subject_name), [monthlyRows]);
  const semesterSummary = useMemo(
    () => summarize(monthlyRows, (row) => `${row.year}/${row.semester}`),
    [monthlyRows],
  );

  return (
    <DashboardLayout
      heading="HOD / Principal Dashboard"
      subtitle="View overall attendance reports."
      links={[
        { href: "#overall", label: "Overall Report" },
        { href: "#subjectSummary", label: "Subject Summary" },
        { href: "#semesterSummary", label: "Semester Summary" },
      ]}
    >
      <div className="card-grid">
        <section className="card" id="overall">
          <h3>Overall Department Attendance Report</h3>
          <div className="form-row">
            <select
              className="form-col-4"
              value={filters.department_id}
              onChange={(event) => setFilters((prev) => ({ ...prev, department_id: event.target.value }))}
            >
              <option value="">CSE Department</option>
              {departments.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
            <input
              className="form-col-4"
              type="month"
              value={filters.month}
              onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
            />
            <button className="form-col-4" type="button" onClick={loadMonthly}>
              Load Report
            </button>
          </div>
          <p className={`message ${isError ? "error" : "success"}`}>{message}</p>
          <div className="table-wrap" style={{ marginTop: "0.9rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Year/Sem</th>
                  <th>Section</th>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Attended</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((row) => (
                  <tr key={`${row.department_id}-${row.year}-${row.semester}-${row.section}-${row.subject_id}`}>
                    <td>{row.department_name}</td>
                    <td>
                      {row.year}/{row.semester}
                    </td>
                    <td>{row.section}</td>
                    <td>{row.subject_name}</td>
                    <td>{row.total_classes}</td>
                    <td>{row.attended_classes}</td>
                    <td className={pctClass(row.percentage)}>{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card card-half" id="subjectSummary">
          <h3>Subject-wise Overall</h3>
          <div className="table-wrap">
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
                {subjectSummary.map((row) => (
                  <tr key={row.key}>
                    <td>{row.key}</td>
                    <td>{row.total}</td>
                    <td>{row.attended}</td>
                    <td className={pctClass(row.percentage)}>{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card card-half" id="semesterSummary">
          <h3>Semester-wise Overall</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Year/Sem</th>
                  <th>Total</th>
                  <th>Attended</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {semesterSummary.map((row) => (
                  <tr key={row.key}>
                    <td>{row.key}</td>
                    <td>{row.total}</td>
                    <td>{row.attended}</td>
                    <td className={pctClass(row.percentage)}>{row.percentage}%</td>
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
