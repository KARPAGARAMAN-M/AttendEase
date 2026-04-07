package utils;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public abstract class BaseHandler implements HttpHandler {
    @Override
    public final void handle(HttpExchange exchange) throws IOException {
        addCorsHeaders(exchange);

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        try {
            handleRequest(exchange);
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(exchange, 400, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            JsonUtil.sendError(exchange, 500, "Internal server error");
        }
    }

    protected abstract void handleRequest(HttpExchange exchange) throws Exception;

    protected void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    protected AuthUtil.SessionUser requireAuth(HttpExchange exchange, String... roles) throws IOException {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        AuthUtil.SessionUser user = AuthUtil.getSession(authHeader);

        if (user == null) {
            JsonUtil.sendError(exchange, 401, "Unauthorized");
            return null;
        }

        if (roles != null && roles.length > 0 && !AuthUtil.hasRole(user, roles)) {
            JsonUtil.sendError(exchange, 403, "Forbidden");
            return null;
        }

        return user;
    }

    protected Integer parseIdFromPath(String fullPath, String prefix) {
        if (!fullPath.startsWith(prefix)) {
            return null;
        }
        String tail = fullPath.substring(prefix.length()).trim();
        if (tail.isBlank()) {
            return null;
        }
        if (tail.startsWith("/")) {
            tail = tail.substring(1);
        }
        if (tail.contains("/")) {
            return null;
        }
        return Integer.parseInt(tail);
    }

    protected Map<String, Object> success(String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("message", message);
        return payload;
    }
}
