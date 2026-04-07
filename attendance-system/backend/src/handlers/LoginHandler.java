package handlers;

import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import db.DBConnection;
import models.User;
import utils.AuthUtil;
import utils.BaseHandler;
import utils.JsonUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class LoginHandler extends BaseHandler {
    @Override
    protected void handleRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if ("/api/login".equals(path)) {
            if (!"POST".equalsIgnoreCase(method)) {
                JsonUtil.sendError(exchange, 405, "Method not allowed");
                return;
            }
            login(exchange);
            return;
        }

        if ("/api/me".equals(path)) {
            if (!"GET".equalsIgnoreCase(method)) {
                JsonUtil.sendError(exchange, 405, "Method not allowed");
                return;
            }
            me(exchange);
            return;
        }

        JsonUtil.sendError(exchange, 404, "Route not found");
    }

    private void login(HttpExchange exchange) throws Exception {
        JsonObject body = JsonUtil.readJsonBody(exchange);
        String username = body.has("username") ? body.get("username").getAsString().trim() : "";
        String password = body.has("password") ? body.get("password").getAsString().trim() : "";

        if (username.isBlank() || password.isBlank()) {
            JsonUtil.sendError(exchange, 400, "username and password are required");
            return;
        }

        String sql = "SELECT id, username, password, role, name, email FROM users WHERE username = ? AND password = ?";

        try (Connection connection = DBConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, username);
            statement.setString(2, password);

            try (ResultSet rs = statement.executeQuery()) {
                if (!rs.next()) {
                    JsonUtil.sendError(exchange, 401, "Invalid credentials");
                    return;
                }

                User user = new User(
                        rs.getInt("id"),
                        rs.getString("username"),
                        rs.getString("password"),
                        rs.getString("role"),
                        rs.getString("name"),
                        rs.getString("email")
                );

                String token = AuthUtil.createSession(user);

                Map<String, Object> payload = new HashMap<>();
                payload.put("success", true);
                payload.put("token", token);

                Map<String, Object> userPayload = new HashMap<>();
                userPayload.put("id", user.getId());
                userPayload.put("username", user.getUsername());
                userPayload.put("role", user.getRole());
                userPayload.put("name", user.getName());
                userPayload.put("email", user.getEmail());
                payload.put("user", userPayload);

                JsonUtil.sendJson(exchange, 200, payload);
            }
        }
    }

    private void me(HttpExchange exchange) throws Exception {
        AuthUtil.SessionUser user = requireAuth(exchange);
        if (user == null) {
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", user.getId());
        payload.put("username", user.getUsername());
        payload.put("role", user.getRole());
        payload.put("name", user.getName());
        payload.put("email", user.getEmail());

        JsonUtil.sendJson(exchange, 200, payload);
    }
}
