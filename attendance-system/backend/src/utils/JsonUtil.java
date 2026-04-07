package utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class JsonUtil {
    private static final Gson GSON = new GsonBuilder().serializeNulls().create();

    private JsonUtil() {
    }

    public static Gson gson() {
        return GSON;
    }

    public static JsonObject readJsonBody(HttpExchange exchange) throws IOException {
        String body = readBody(exchange.getRequestBody());
        if (body.isBlank()) {
            return new JsonObject();
        }
        return JsonParser.parseString(body).getAsJsonObject();
    }

    public static String readBody(InputStream inputStream) throws IOException {
        return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    }

    public static Map<String, String> queryParams(HttpExchange exchange) {
        Map<String, String> params = new HashMap<>();
        String query = exchange.getRequestURI().getRawQuery();
        if (query == null || query.isBlank()) {
            return params;
        }

        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            String key = decode(kv[0]);
            String value = kv.length > 1 ? decode(kv[1]) : "";
            params.put(key, value);
        }

        return params;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    public static void sendJson(HttpExchange exchange, int status, Object payload) throws IOException {
        byte[] bytes = GSON.toJson(payload).getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
    }

    public static void sendBinary(HttpExchange exchange, int status, byte[] payload, String contentType, String filename) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        exchange.sendResponseHeaders(status, payload.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(payload);
        }
    }

    public static void sendMessage(HttpExchange exchange, int status, String message) throws IOException {
        Map<String, Object> payload = new HashMap<>();
        payload.put("message", message);
        sendJson(exchange, status, payload);
    }

    public static void sendError(HttpExchange exchange, int status, String message) throws IOException {
        Map<String, Object> payload = new HashMap<>();
        payload.put("error", true);
        payload.put("message", message);
        sendJson(exchange, status, payload);
    }
}
