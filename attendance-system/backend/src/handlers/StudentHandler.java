package handlers;

import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import db.DBConnection;
import utils.AuthUtil;
import utils.BaseHandler;
import utils.JsonUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StudentHandler extends BaseHandler {
    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if ("/api/students".equals(path)) {
            if ("GET".equalsIgnoreCase(method)) {
                AuthUtil.SessionUser sessionUser = requireAuth(exchange, "ADMIN", "TEACHER", "HOD", "STUDENT");
                if (sessionUser == null) {
                    return;
                }
                listStudents(exchange, sessionUser);
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN") == null) {
                    return;
                }
                createStudent(exchange);
                return;
            }

            JsonUtil.sendError(exchange, 405, "Method not allowed");
            return;
        }

        if (path.startsWith("/api/students/")) {
            Integer studentId;
            try {
                studentId = parseIdFromPath(path, "/api/students/");
            } catch (NumberFormatException ex) {
                JsonUtil.sendError(exchange, 400, "Invalid student id");
                return;
            }

            if (studentId == null) {
                JsonUtil.sendError(exchange, 400, "Student id is required");
                return;
            }

            if ("PUT".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN") == null) {
                    return;
                }
                updateStudent(exchange, studentId);
                return;
            }

            if ("DELETE".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN") == null) {
                    return;
                }
                deleteStudent(exchange, studentId);
                return;
            }

            JsonUtil.sendError(exchange, 405, "Method not allowed");
            return;
        }

        JsonUtil.sendError(exchange, 404, "Route not found");
    }

    private void listStudents(HttpExchange exchange, AuthUtil.SessionUser sessionUser) throws Exception {
        Map<String, String> filters = JsonUtil.queryParams(exchange);

        StringBuilder sql = new StringBuilder(
                "SELECT s.id, s.user_id, s.roll_no, s.department_id, d.name AS department_name, " +
                        "s.year, s.semester, s.section, u.username, u.name, u.email " +
                        "FROM students s " +
                        "JOIN users u ON s.user_id = u.id " +
                        "JOIN departments d ON s.department_id = d.id " +
                        "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (filters.containsKey("department_id") && !filters.get("department_id").isBlank()) {
            sql.append("AND s.department_id = ? ");
            params.add(Integer.parseInt(filters.get("department_id")));
        }

        if ("STUDENT".equals(sessionUser.getRole())) {
            sql.append("AND s.user_id = ? ");
            params.add(sessionUser.getId());
        }
        if (filters.containsKey("year") && !filters.get("year").isBlank()) {
            sql.append("AND s.year = ? ");
            params.add(Integer.parseInt(filters.get("year")));
        }
        if (filters.containsKey("semester") && !filters.get("semester").isBlank()) {
            sql.append("AND s.semester = ? ");
            params.add(Integer.parseInt(filters.get("semester")));
        }
        if (filters.containsKey("section") && !filters.get("section").isBlank()) {
            sql.append("AND s.section = ? ");
            params.add(filters.get("section"));
        }

        sql.append("ORDER BY d.name, s.year, s.semester, s.section, s.roll_no");

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
                List<Map<String, Object>> students = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", rs.getInt("id"));
                    item.put("user_id", rs.getInt("user_id"));
                    item.put("username", rs.getString("username"));
                    item.put("name", rs.getString("name"));
                    item.put("email", rs.getString("email"));
                    item.put("roll_no", rs.getString("roll_no"));
                    item.put("department_id", rs.getInt("department_id"));
                    item.put("department_name", rs.getString("department_name"));
                    item.put("year", rs.getInt("year"));
                    item.put("semester", rs.getInt("semester"));
                    item.put("section", rs.getString("section"));
                    students.add(item);
                }

                JsonUtil.sendJson(exchange, 200, students);
            }
        }
    }

    private void createStudent(HttpExchange exchange) throws Exception {
        JsonObject body = JsonUtil.readJsonBody(exchange);

        String username = required(body, "username");
        String password = required(body, "password");
        String name = required(body, "name");
        String email = required(body, "email");
        String rollNo = required(body, "roll_no");
        int departmentId = requiredInt(body, "department_id");
        int year = requiredInt(body, "year");
        int semester = requiredInt(body, "semester");
        String section = required(body, "section");

        String insertUserSql = "INSERT INTO users (username, password, role, name, email) VALUES (?, ?, 'STUDENT', ?, ?)";
        String insertStudentSql = "INSERT INTO students (user_id, roll_no, department_id, year, semester, section) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);
            try {
                int userId;
                try (PreparedStatement userStatement = connection.prepareStatement(insertUserSql, Statement.RETURN_GENERATED_KEYS)) {
                    userStatement.setString(1, username);
                    userStatement.setString(2, password);
                    userStatement.setString(3, name);
                    userStatement.setString(4, email);
                    userStatement.executeUpdate();

                    try (ResultSet keys = userStatement.getGeneratedKeys()) {
                        if (!keys.next()) {
                            throw new SQLException("Could not create user record");
                        }
                        userId = keys.getInt(1);
                    }
                }

                int studentId;
                try (PreparedStatement studentStatement = connection.prepareStatement(insertStudentSql, Statement.RETURN_GENERATED_KEYS)) {
                    studentStatement.setInt(1, userId);
                    studentStatement.setString(2, rollNo);
                    studentStatement.setInt(3, departmentId);
                    studentStatement.setInt(4, year);
                    studentStatement.setInt(5, semester);
                    studentStatement.setString(6, section);
                    studentStatement.executeUpdate();

                    try (ResultSet keys = studentStatement.getGeneratedKeys()) {
                        if (!keys.next()) {
                            throw new SQLException("Could not create student record");
                        }
                        studentId = keys.getInt(1);
                    }
                }

                connection.commit();

                Map<String, Object> payload = success("Student created successfully");
                payload.put("id", studentId);
                payload.put("user_id", userId);
                JsonUtil.sendJson(exchange, 201, payload);
            } catch (Exception ex) {
                connection.rollback();
                throw ex;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    private void updateStudent(HttpExchange exchange, int studentId) throws Exception {
        JsonObject body = JsonUtil.readJsonBody(exchange);

        String username = required(body, "username");
        String name = required(body, "name");
        String email = required(body, "email");
        String rollNo = required(body, "roll_no");
        int departmentId = requiredInt(body, "department_id");
        int year = requiredInt(body, "year");
        int semester = requiredInt(body, "semester");
        String section = required(body, "section");
        String password = optional(body, "password");

        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);
            try {
                int userId = fetchStudentUserId(connection, studentId);
                if (userId == -1) {
                    JsonUtil.sendError(exchange, 404, "Student not found");
                    connection.rollback();
                    return;
                }

                if (password == null || password.isBlank()) {
                    try (PreparedStatement ps = connection.prepareStatement(
                            "UPDATE users SET username = ?, name = ?, email = ? WHERE id = ?")) {
                        ps.setString(1, username);
                        ps.setString(2, name);
                        ps.setString(3, email);
                        ps.setInt(4, userId);
                        ps.executeUpdate();
                    }
                } else {
                    try (PreparedStatement ps = connection.prepareStatement(
                            "UPDATE users SET username = ?, password = ?, name = ?, email = ? WHERE id = ?")) {
                        ps.setString(1, username);
                        ps.setString(2, password);
                        ps.setString(3, name);
                        ps.setString(4, email);
                        ps.setInt(5, userId);
                        ps.executeUpdate();
                    }
                }

                try (PreparedStatement ps = connection.prepareStatement(
                        "UPDATE students SET roll_no = ?, department_id = ?, year = ?, semester = ?, section = ? WHERE id = ?")) {
                    ps.setString(1, rollNo);
                    ps.setInt(2, departmentId);
                    ps.setInt(3, year);
                    ps.setInt(4, semester);
                    ps.setString(5, section);
                    ps.setInt(6, studentId);
                    ps.executeUpdate();
                }

                connection.commit();
                JsonUtil.sendJson(exchange, 200, success("Student updated successfully"));
            } catch (Exception ex) {
                connection.rollback();
                throw ex;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    private void deleteStudent(HttpExchange exchange, int studentId) throws Exception {
        try (Connection connection = DBConnection.getConnection()) {
            connection.setAutoCommit(false);
            try {
                int userId = fetchStudentUserId(connection, studentId);
                if (userId == -1) {
                    JsonUtil.sendError(exchange, 404, "Student not found");
                    connection.rollback();
                    return;
                }

                try (PreparedStatement ps = connection.prepareStatement("DELETE FROM users WHERE id = ?")) {
                    ps.setInt(1, userId);
                    ps.executeUpdate();
                }

                connection.commit();
                JsonUtil.sendJson(exchange, 200, success("Student deleted successfully"));
            } catch (Exception ex) {
                connection.rollback();
                throw ex;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    private int fetchStudentUserId(Connection connection, int studentId) throws Exception {
        try (PreparedStatement ps = connection.prepareStatement("SELECT user_id FROM students WHERE id = ?")) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("user_id");
                }
            }
        }
        return -1;
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

    private String optional(JsonObject body, String field) {
        if (!body.has(field) || body.get(field).isJsonNull()) {
            return null;
        }
        return body.get(field).getAsString().trim();
    }
}
