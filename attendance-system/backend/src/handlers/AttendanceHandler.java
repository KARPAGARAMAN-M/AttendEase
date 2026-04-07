package handlers;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import db.DBConnection;
import utils.AuthUtil;
import utils.BaseHandler;
import utils.JsonUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AttendanceHandler extends BaseHandler {
    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if (!"/api/attendance".equals(path)) {
            JsonUtil.sendError(exchange, 404, "Route not found");
            return;
        }

        if ("POST".equalsIgnoreCase(method)) {
            AuthUtil.SessionUser user = requireAuth(exchange, "ADMIN", "TEACHER");
            if (user == null) {
                return;
            }
            markAttendance(exchange, user);
            return;
        }

        if ("GET".equalsIgnoreCase(method)) {
            if (requireAuth(exchange, "ADMIN", "TEACHER", "HOD") == null) {
                return;
            }
            listAttendance(exchange);
            return;
        }

        JsonUtil.sendError(exchange, 405, "Method not allowed");
    }

    private void markAttendance(HttpExchange exchange, AuthUtil.SessionUser user) throws Exception {
        JsonObject body = JsonUtil.readJsonBody(exchange);

        int subjectId = requiredInt(body, "subject_id");
        String dateString = body.has("date") && !body.get("date").isJsonNull()
                ? body.get("date").getAsString().trim()
                : LocalDate.now().toString();

        LocalDate date;
        try {
            date = LocalDate.parse(dateString);
        } catch (DateTimeParseException e) {
            JsonUtil.sendError(exchange, 400, "date must be in YYYY-MM-DD format");
            return;
        }

        if ("TEACHER".equals(user.getRole()) && !teacherAssignedToSubject(user.getId(), subjectId)) {
            JsonUtil.sendError(exchange, 403, "Teacher is not assigned to the selected subject");
            return;
        }

        if (!body.has("entries") || !body.get("entries").isJsonArray()) {
            JsonUtil.sendError(exchange, 400, "entries array is required");
            return;
        }

        JsonArray entries = body.getAsJsonArray("entries");
        if (entries.isEmpty()) {
            JsonUtil.sendError(exchange, 400, "entries cannot be empty");
            return;
        }

        String sql = "INSERT INTO attendance (student_id, subject_id, attendance_date, status, marked_by) " +
                "VALUES (?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), created_at = CURRENT_TIMESTAMP";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            int count = 0;
            for (JsonElement element : entries) {
                if (!element.isJsonObject()) {
                    continue;
                }

                JsonObject item = element.getAsJsonObject();
                int studentId = requiredInt(item, "student_id");
                String status = required(item, "status");
                if (!isValidStatus(status)) {
                    throw new IllegalArgumentException("Invalid status: " + status + " (allowed: Present, Absent, Late)");
                }

                statement.setInt(1, studentId);
                statement.setInt(2, subjectId);
                statement.setDate(3, java.sql.Date.valueOf(date));
                statement.setString(4, normalizeStatus(status));
                statement.setInt(5, user.getId());
                statement.addBatch();
                count++;
            }

            statement.executeBatch();

            Map<String, Object> payload = success("Attendance saved successfully");
            payload.put("subject_id", subjectId);
            payload.put("date", date.toString());
            payload.put("records", count);
            JsonUtil.sendJson(exchange, 200, payload);
        }
    }

    private void listAttendance(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonUtil.queryParams(exchange);

        StringBuilder sql = new StringBuilder(
                "SELECT a.id, a.student_id, u.name AS student_name, s.roll_no, a.subject_id, sub.name AS subject_name, " +
                        "a.attendance_date, a.status, a.marked_by " +
                        "FROM attendance a " +
                        "JOIN students s ON a.student_id = s.id " +
                        "JOIN users u ON s.user_id = u.id " +
                        "JOIN subjects sub ON a.subject_id = sub.id " +
                        "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (query.containsKey("student_id") && !query.get("student_id").isBlank()) {
            sql.append("AND a.student_id = ? ");
            params.add(Integer.parseInt(query.get("student_id")));
        }
        if (query.containsKey("subject_id") && !query.get("subject_id").isBlank()) {
            sql.append("AND a.subject_id = ? ");
            params.add(Integer.parseInt(query.get("subject_id")));
        }
        if (query.containsKey("date") && !query.get("date").isBlank()) {
            sql.append("AND a.attendance_date = ? ");
            params.add(query.get("date"));
        }

        sql.append("ORDER BY a.attendance_date DESC, s.roll_no");

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                Object value = params.get(i);
                if (value instanceof Integer) {
                    statement.setInt(i + 1, (Integer) value);
                } else {
                    statement.setString(i + 1, value.toString());
                }
            }

            try (ResultSet rs = statement.executeQuery()) {
                List<Map<String, Object>> rows = new ArrayList<>();
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
                    row.put("marked_by", rs.getObject("marked_by"));
                    rows.add(row);
                }
                JsonUtil.sendJson(exchange, 200, rows);
            }
        }
    }

    private boolean teacherAssignedToSubject(int teacherId, int subjectId) throws Exception {
        String sql = "SELECT id FROM subjects WHERE id = ? AND teacher_id = ?";
        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, subjectId);
            statement.setInt(2, teacherId);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next();
            }
        }
    }

    private String required(JsonObject body, String field) {
        if (!body.has(field) || body.get(field).isJsonNull()) {
            throw new IllegalArgumentException(field + " is required");
        }
        String value = body.get(field).getAsString().trim();
        if (value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value;
    }

    private int requiredInt(JsonObject body, String field) {
        if (!body.has(field) || body.get(field).isJsonNull()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return body.get(field).getAsInt();
    }

    private boolean isValidStatus(String status) {
        String normalized = normalizeStatus(status);
        return "Present".equals(normalized) || "Absent".equals(normalized) || "Late".equals(normalized);
    }

    private String normalizeStatus(String status) {
        String lower = status.trim().toLowerCase();
        if ("present".equals(lower)) {
            return "Present";
        }
        if ("absent".equals(lower)) {
            return "Absent";
        }
        if ("late".equals(lower)) {
            return "Late";
        }
        return status;
    }
}
