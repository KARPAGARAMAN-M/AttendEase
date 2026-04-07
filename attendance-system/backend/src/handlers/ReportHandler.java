package handlers;

import com.sun.net.httpserver.HttpExchange;
import db.DBConnection;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import utils.AuthUtil;
import utils.BaseHandler;
import utils.JsonUtil;

import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReportHandler extends BaseHandler {
    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (!"GET".equalsIgnoreCase(method)) {
            JsonUtil.sendError(exchange, 405, "Method not allowed");
            return;
        }

        if ("/api/attendance/report".equals(path)) {
            AuthUtil.SessionUser user = requireAuth(exchange, "ADMIN", "TEACHER", "HOD", "STUDENT");
            if (user == null) {
                return;
            }
            studentWiseReport(exchange, user);
            return;
        }

        if ("/api/attendance/monthly".equals(path)) {
            if (requireAuth(exchange, "ADMIN", "TEACHER", "HOD") == null) {
                return;
            }
            monthlyReport(exchange);
            return;
        }

        if ("/api/attendance/alert".equals(path)) {
            if (requireAuth(exchange, "ADMIN", "TEACHER", "HOD") == null) {
                return;
            }
            alertReport(exchange);
            return;
        }

        if ("/api/attendance/export/pdf".equals(path)) {
            if (requireAuth(exchange, "ADMIN", "TEACHER", "HOD") == null) {
                return;
            }
            exportPdf(exchange);
            return;
        }

        if ("/api/attendance/export/excel".equals(path)) {
            if (requireAuth(exchange, "ADMIN", "TEACHER", "HOD") == null) {
                return;
            }
            exportExcel(exchange);
            return;
        }

        JsonUtil.sendError(exchange, 404, "Route not found");
    }

    private void studentWiseReport(HttpExchange exchange, AuthUtil.SessionUser sessionUser) throws Exception {
        Map<String, String> query = JsonUtil.queryParams(exchange);

        Integer studentId = parseOptionalInt(query.get("student_id"));
        Integer subjectId = parseOptionalInt(query.get("subject_id"));

        if ("STUDENT".equals(sessionUser.getRole())) {
            Integer ownStudentId = findStudentIdByUserId(sessionUser.getId());
            if (ownStudentId == null) {
                JsonUtil.sendError(exchange, 404, "Student profile not found for logged-in user");
                return;
            }
            if (studentId != null && !studentId.equals(ownStudentId)) {
                JsonUtil.sendError(exchange, 403, "Students can only view their own report");
                return;
            }
            studentId = ownStudentId;
        }

        ReportData data = fetchStudentReportData(studentId, subjectId);

        Map<String, Object> payload = new HashMap<>();
        payload.put("records", data.records);
        payload.put("subject_summary", data.subjectSummary);
        payload.put("overall", data.overallSummary);
        JsonUtil.sendJson(exchange, 200, payload);
    }

    private ReportData fetchStudentReportData(Integer studentId, Integer subjectId) throws Exception {
        StringBuilder recordSql = new StringBuilder(
                "SELECT a.id, a.student_id, u.name AS student_name, st.roll_no, " +
                        "a.subject_id, sub.name AS subject_name, a.attendance_date, a.status " +
                        "FROM attendance a " +
                        "JOIN students st ON a.student_id = st.id " +
                        "JOIN users u ON st.user_id = u.id " +
                        "JOIN subjects sub ON a.subject_id = sub.id " +
                        "WHERE 1=1 "
        );

        List<Object> recordParams = new ArrayList<>();
        if (studentId != null) {
            recordSql.append("AND a.student_id = ? ");
            recordParams.add(studentId);
        }
        if (subjectId != null) {
            recordSql.append("AND a.subject_id = ? ");
            recordParams.add(subjectId);
        }
        recordSql.append("ORDER BY a.attendance_date DESC, st.roll_no");

        StringBuilder summarySql = new StringBuilder(
                "SELECT a.student_id, st.roll_no, u.name AS student_name, sub.id AS subject_id, sub.name AS subject_name, " +
                        "COUNT(*) AS total_classes, " +
                        "SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_classes, " +
                        "ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percentage " +
                        "FROM attendance a " +
                        "JOIN students st ON a.student_id = st.id " +
                        "JOIN users u ON st.user_id = u.id " +
                        "JOIN subjects sub ON a.subject_id = sub.id " +
                        "WHERE 1=1 "
        );

        List<Object> summaryParams = new ArrayList<>();
        if (studentId != null) {
            summarySql.append("AND a.student_id = ? ");
            summaryParams.add(studentId);
        }
        if (subjectId != null) {
            summarySql.append("AND a.subject_id = ? ");
            summaryParams.add(subjectId);
        }
        summarySql.append("GROUP BY a.student_id, st.roll_no, u.name, sub.id, sub.name ORDER BY u.name, sub.name");

        List<Map<String, Object>> records = new ArrayList<>();
        List<Map<String, Object>> subjectSummary = new ArrayList<>();

        int totalClasses = 0;
        int attendedClasses = 0;

        try (Connection connection = DBConnection.getConnection()) {
            try (PreparedStatement ps = connection.prepareStatement(recordSql.toString())) {
                bind(ps, recordParams);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> row = new HashMap<>();
                        row.put("id", rs.getInt("id"));
                        row.put("student_id", rs.getInt("student_id"));
                        row.put("student_name", rs.getString("student_name"));
                        row.put("roll_no", rs.getString("roll_no"));
                        row.put("subject_id", rs.getInt("subject_id"));
                        row.put("subject_name", rs.getString("subject_name"));
                        row.put("date", rs.getString("attendance_date"));
                        row.put("status", rs.getString("status"));
                        records.add(row);
                    }
                }
            }

            try (PreparedStatement ps = connection.prepareStatement(summarySql.toString())) {
                bind(ps, summaryParams);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        int total = rs.getInt("total_classes");
                        int attended = rs.getInt("attended_classes");
                        totalClasses += total;
                        attendedClasses += attended;

                        Map<String, Object> row = new HashMap<>();
                        row.put("student_id", rs.getInt("student_id"));
                        row.put("student_name", rs.getString("student_name"));
                        row.put("roll_no", rs.getString("roll_no"));
                        row.put("subject_id", rs.getInt("subject_id"));
                        row.put("subject_name", rs.getString("subject_name"));
                        row.put("total_classes", total);
                        row.put("attended_classes", attended);
                        row.put("percentage", rs.getDouble("percentage"));
                        subjectSummary.add(row);
                    }
                }
            }
        }

        double overallPercentage = totalClasses == 0 ? 0 : (attendedClasses * 100.0) / totalClasses;

        Map<String, Object> overall = new HashMap<>();
        overall.put("total_classes", totalClasses);
        overall.put("attended_classes", attendedClasses);
        overall.put("percentage", Math.round(overallPercentage * 100.0) / 100.0);

        return new ReportData(records, subjectSummary, overall);
    }

    private void monthlyReport(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonUtil.queryParams(exchange);
        String monthParam = query.getOrDefault("month", YearMonth.now().toString());
        Integer departmentId = parseOptionalInt(query.get("department_id"));

        try {
            YearMonth.parse(monthParam);
        } catch (DateTimeParseException e) {
            JsonUtil.sendError(exchange, 400, "month must be in YYYY-MM format");
            return;
        }

        StringBuilder sql = new StringBuilder(
                "SELECT d.id AS department_id, d.name AS department_name, st.year, st.semester, st.section, " +
                        "sub.id AS subject_id, sub.name AS subject_name, " +
                        "COUNT(*) AS total_classes, " +
                        "SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_classes, " +
                        "ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS percentage " +
                        "FROM attendance a " +
                        "JOIN students st ON a.student_id = st.id " +
                        "JOIN departments d ON st.department_id = d.id " +
                        "JOIN subjects sub ON a.subject_id = sub.id " +
                        "WHERE DATE_FORMAT(a.attendance_date, '%Y-%m') = ? "
        );

        List<Object> params = new ArrayList<>();
        params.add(monthParam);

        if (departmentId != null) {
            sql.append("AND d.id = ? ");
            params.add(departmentId);
        }

        sql.append("GROUP BY d.id, d.name, st.year, st.semester, st.section, sub.id, sub.name ");
        sql.append("ORDER BY d.name, st.year, st.semester, st.section, sub.name");

        List<Map<String, Object>> rows = new ArrayList<>();

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql.toString())) {
            bind(statement, params);
            try (ResultSet rs = statement.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("department_id", rs.getInt("department_id"));
                    row.put("department_name", rs.getString("department_name"));
                    row.put("year", rs.getInt("year"));
                    row.put("semester", rs.getInt("semester"));
                    row.put("section", rs.getString("section"));
                    row.put("subject_id", rs.getInt("subject_id"));
                    row.put("subject_name", rs.getString("subject_name"));
                    row.put("total_classes", rs.getInt("total_classes"));
                    row.put("attended_classes", rs.getInt("attended_classes"));
                    row.put("percentage", rs.getDouble("percentage"));
                    rows.add(row);
                }
            }
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("month", monthParam);
        payload.put("department_id", departmentId);
        payload.put("rows", rows);
        JsonUtil.sendJson(exchange, 200, payload);
    }

    private void alertReport(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonUtil.queryParams(exchange);
        double threshold = query.containsKey("threshold") ? Double.parseDouble(query.get("threshold")) : 75.0;
        Integer departmentId = parseOptionalInt(query.get("department_id"));

        List<Map<String, Object>> rows = fetchAlertRows(threshold, departmentId);

        Map<String, Object> payload = new HashMap<>();
        payload.put("threshold", threshold);
        payload.put("rows", rows);
        JsonUtil.sendJson(exchange, 200, payload);
    }

    private void exportPdf(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonUtil.queryParams(exchange);
        double threshold = query.containsKey("threshold") ? Double.parseDouble(query.get("threshold")) : 75.0;
        Integer departmentId = parseOptionalInt(query.get("department_id"));

        List<Map<String, Object>> rows = fetchAlertRows(threshold, departmentId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, baos);

        document.open();
        document.add(new Paragraph("Attendance Alert Report"));
        document.add(new Paragraph("Threshold: " + threshold + "%"));
        document.add(new Paragraph("Generated: " + java.time.LocalDate.now()));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        addPdfHeader(table, "Student ID");
        addPdfHeader(table, "Name");
        addPdfHeader(table, "Roll No");
        addPdfHeader(table, "Department");
        addPdfHeader(table, "Total");
        addPdfHeader(table, "Attended");
        addPdfHeader(table, "Percentage");

        for (Map<String, Object> row : rows) {
            table.addCell(value(row.get("student_id")));
            table.addCell(value(row.get("student_name")));
            table.addCell(value(row.get("roll_no")));
            table.addCell(value(row.get("department_name")));
            table.addCell(value(row.get("total_classes")));
            table.addCell(value(row.get("attended_classes")));
            table.addCell(value(row.get("percentage")) + "%");
        }

        document.add(table);
        document.close();

        JsonUtil.sendBinary(exchange, 200, baos.toByteArray(), "application/pdf", "attendance-alert-report.pdf");
    }

    private void exportExcel(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonUtil.queryParams(exchange);
        double threshold = query.containsKey("threshold") ? Double.parseDouble(query.get("threshold")) : 75.0;
        Integer departmentId = parseOptionalInt(query.get("department_id"));

        List<Map<String, Object>> rows = fetchAlertRows(threshold, departmentId);

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Attendance Alert");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            Row header = sheet.createRow(0);
            String[] columns = {
                    "Student ID", "Name", "Roll No", "Department", "Total", "Attended", "Percentage"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Map<String, Object> row : rows) {
                Row excelRow = sheet.createRow(rowNum++);
                excelRow.createCell(0).setCellValue(value(row.get("student_id")));
                excelRow.createCell(1).setCellValue(value(row.get("student_name")));
                excelRow.createCell(2).setCellValue(value(row.get("roll_no")));
                excelRow.createCell(3).setCellValue(value(row.get("department_name")));
                excelRow.createCell(4).setCellValue(value(row.get("total_classes")));
                excelRow.createCell(5).setCellValue(value(row.get("attended_classes")));
                excelRow.createCell(6).setCellValue(value(row.get("percentage")));
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            JsonUtil.sendBinary(
                    exchange,
                    200,
                    out.toByteArray(),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "attendance-alert-report.xlsx"
            );
        }
    }

    private List<Map<String, Object>> fetchAlertRows(double threshold, Integer departmentId) throws Exception {
        StringBuilder sql = new StringBuilder(
                "SELECT st.id AS student_id, u.name AS student_name, st.roll_no, d.name AS department_name, " +
                        "COUNT(a.id) AS total_classes, " +
                        "SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_classes, " +
                        "ROUND((IFNULL(SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END), 0) / NULLIF(COUNT(a.id), 0)) * 100, 2) AS percentage " +
                        "FROM students st " +
                        "JOIN users u ON st.user_id = u.id " +
                        "JOIN departments d ON st.department_id = d.id " +
                        "LEFT JOIN attendance a ON st.id = a.student_id " +
                        "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();
        if (departmentId != null) {
            sql.append("AND d.id = ? ");
            params.add(departmentId);
        }

        sql.append("GROUP BY st.id, u.name, st.roll_no, d.name ");
        sql.append("HAVING (COUNT(a.id) = 0 OR ((IFNULL(SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END), 0) / NULLIF(COUNT(a.id), 0)) * 100) < ?) ");
        params.add(threshold);
        sql.append("ORDER BY percentage ASC, u.name ASC");

        List<Map<String, Object>> rows = new ArrayList<>();

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql.toString())) {
            bind(statement, params);
            try (ResultSet rs = statement.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    int totalClasses = rs.getInt("total_classes");
                    int attendedClasses = rs.getInt("attended_classes");
                    double percentage = totalClasses == 0 ? 0.0 : rs.getDouble("percentage");

                    row.put("student_id", rs.getInt("student_id"));
                    row.put("student_name", rs.getString("student_name"));
                    row.put("roll_no", rs.getString("roll_no"));
                    row.put("department_name", rs.getString("department_name"));
                    row.put("total_classes", totalClasses);
                    row.put("attended_classes", attendedClasses);
                    row.put("percentage", percentage);
                    rows.add(row);
                }
            }
        }

        return rows;
    }

    private void addPdfHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        table.addCell(cell);
    }

    private Integer findStudentIdByUserId(int userId) throws Exception {
        String sql = "SELECT id FROM students WHERE user_id = ?";
        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, userId);
            try (ResultSet rs = statement.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }
        return null;
    }

    private Integer parseOptionalInt(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Integer.parseInt(value);
    }

    private void bind(PreparedStatement statement, List<Object> params) throws Exception {
        for (int i = 0; i < params.size(); i++) {
            Object param = params.get(i);
            if (param instanceof Integer) {
                statement.setInt(i + 1, (Integer) param);
            } else if (param instanceof Double) {
                statement.setDouble(i + 1, (Double) param);
            } else {
                statement.setString(i + 1, param.toString());
            }
        }
    }

    private String value(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static class ReportData {
        private final List<Map<String, Object>> records;
        private final List<Map<String, Object>> subjectSummary;
        private final Map<String, Object> overallSummary;

        private ReportData(List<Map<String, Object>> records,
                           List<Map<String, Object>> subjectSummary,
                           Map<String, Object> overallSummary) {
            this.records = records;
            this.subjectSummary = subjectSummary;
            this.overallSummary = overallSummary;
        }
    }
}
