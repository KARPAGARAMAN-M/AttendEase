package handlers;

import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import db.DBConnection;
import utils.BaseHandler;
import utils.JsonUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TeacherHandler extends BaseHandler {
    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if ("/api/teachers".equals(path)) {
            if ("GET".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN", "HOD", "TEACHER") == null) {
                    return;
                }
                getTeachers(exchange);
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN") == null) {
                    return;
                }
                createTeacher(exchange);
                return;
            }

            JsonUtil.sendError(exchange, 405, "Method not allowed");
            return;
        }

        if ("/api/subjects".equals(path)) {
            if ("GET".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN", "HOD", "TEACHER", "STUDENT") == null) {
                    return;
                }
                getSubjects(exchange);
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN") == null) {
                    return;
                }
                createSubject(exchange);
                return;
            }

            JsonUtil.sendError(exchange, 405, "Method not allowed");
            return;
        }

        if ("/api/departments".equals(path)) {
            if ("GET".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN", "HOD", "TEACHER", "STUDENT") == null) {
                    return;
                }
                getDepartments(exchange);
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                if (requireAuth(exchange, "ADMIN") == null) {
                    return;
                }
                createDepartment(exchange);
                return;
            }

            JsonUtil.sendError(exchange, 405, "Method not allowed");
            return;
        }

        JsonUtil.sendError(exchange, 404, "Route not found");
    }

    private void getTeachers(HttpExchange exchange) throws Exception {
        String sql = "SELECT id, username, role, name, email FROM users WHERE role = 'TEACHER' ORDER BY name";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            List<Map<String, Object>> teachers = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("username", rs.getString("username"));
                row.put("role", rs.getString("role"));
                row.put("name", rs.getString("name"));
                row.put("email", rs.getString("email"));
                teachers.add(row);
            }

            JsonUtil.sendJson(exchange, 200, teachers);
        }
    }

    private void createTeacher(HttpExchange exchange) throws Exception {
        JsonObject body = JsonUtil.readJsonBody(exchange);

        String username = required(body, "username");
        String password = required(body, "password");
        String name = required(body, "name");
        String email = required(body, "email");

        String sql = "INSERT INTO users (username, password, role, name, email) VALUES (?, ?, 'TEACHER', ?, ?)";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, username);
            statement.setString(2, password);
            statement.setString(3, name);
            statement.setString(4, email);
            statement.executeUpdate();

            int id;
            try (ResultSet rs = statement.getGeneratedKeys()) {
                if (!rs.next()) {
                    throw new IllegalStateException("Could not retrieve teacher id");
                }
                id = rs.getInt(1);
            }

            Map<String, Object> payload = success("Teacher created successfully");
            payload.put("id", id);
            JsonUtil.sendJson(exchange, 201, payload);
        }
    }

    private void getSubjects(HttpExchange exchange) throws Exception {
        Map<String, String> query = JsonUtil.queryParams(exchange);

        StringBuilder sql = new StringBuilder(
                "SELECT s.id, s.name, s.department_id, d.name AS department_name, s.teacher_id, u.name AS teacher_name " +
                        "FROM subjects s " +
                        "JOIN departments d ON s.department_id = d.id " +
                        "LEFT JOIN users u ON s.teacher_id = u.id " +
                        "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (query.containsKey("department_id") && !query.get("department_id").isBlank()) {
            sql.append("AND s.department_id = ? ");
            params.add(Integer.parseInt(query.get("department_id")));
        }
        if (query.containsKey("teacher_id") && !query.get("teacher_id").isBlank()) {
            sql.append("AND s.teacher_id = ? ");
            params.add(Integer.parseInt(query.get("teacher_id")));
        }

        sql.append("ORDER BY d.name, s.name");

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
                List<Map<String, Object>> subjects = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id", rs.getInt("id"));
                    row.put("name", rs.getString("name"));
                    row.put("department_id", rs.getInt("department_id"));
                    row.put("department_name", rs.getString("department_name"));
                    row.put("teacher_id", rs.getObject("teacher_id"));
                    row.put("teacher_name", rs.getString("teacher_name"));
                    subjects.add(row);
                }
                JsonUtil.sendJson(exchange, 200, subjects);
            }
        }
    }

    private void createSubject(HttpExchange exchange) throws Exception {
        JsonObject body = JsonUtil.readJsonBody(exchange);

        String name = required(body, "name");
        int departmentId = requiredInt(body, "department_id");
        Integer teacherId = body.has("teacher_id") && !body.get("teacher_id").isJsonNull()
                ? body.get("teacher_id").getAsInt()
                : null;

        String sql = "INSERT INTO subjects (name, department_id, teacher_id) VALUES (?, ?, ?)";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, name);
            statement.setInt(2, departmentId);
            if (teacherId == null) {
                statement.setNull(3, java.sql.Types.INTEGER);
            } else {
                statement.setInt(3, teacherId);
            }
            statement.executeUpdate();

            int id;
            try (ResultSet rs = statement.getGeneratedKeys()) {
                if (!rs.next()) {
                    throw new IllegalStateException("Could not retrieve subject id");
                }
                id = rs.getInt(1);
            }

            Map<String, Object> payload = success("Subject created successfully");
            payload.put("id", id);
            JsonUtil.sendJson(exchange, 201, payload);
        }
    }

    private void getDepartments(HttpExchange exchange) throws Exception {
        String sql = "SELECT id, name FROM departments ORDER BY name";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            List<Map<String, Object>> departments = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("name", rs.getString("name"));
                departments.add(row);
            }

            JsonUtil.sendJson(exchange, 200, departments);
        }
    }

    private void createDepartment(HttpExchange exchange) throws Exception {
        JsonObject body = JsonUtil.readJsonBody(exchange);
        String name = required(body, "name");

        String sql = "INSERT INTO departments (name) VALUES (?)";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, name);
            statement.executeUpdate();

            int id;
            try (ResultSet rs = statement.getGeneratedKeys()) {
                if (!rs.next()) {
                    throw new IllegalStateException("Could not retrieve department id");
                }
                id = rs.getInt(1);
            }

            Map<String, Object> payload = success("Department created successfully");
            payload.put("id", id);
            JsonUtil.sendJson(exchange, 201, payload);
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
}
