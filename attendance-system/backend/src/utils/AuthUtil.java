package utils;

import models.User;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class AuthUtil {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Map<String, SessionUser> SESSIONS = new ConcurrentHashMap<>();

    private AuthUtil() {
    }

    public static String createSession(User user) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        SessionUser sessionUser = new SessionUser(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getName(),
                user.getEmail()
        );

        SESSIONS.put(token, sessionUser);
        return token;
    }

    public static SessionUser getSession(String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) {
            return null;
        }
        return SESSIONS.get(token);
    }

    public static boolean hasRole(SessionUser user, String... allowedRoles) {
        if (user == null || allowedRoles == null || allowedRoles.length == 0) {
            return false;
        }

        Set<String> allowed = Set.of(allowedRoles);
        return allowed.contains(user.getRole());
    }

    public static String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }

        String trimmed = authHeader.trim();
        if (trimmed.toLowerCase().startsWith("bearer ")) {
            return trimmed.substring(7).trim();
        }

        return trimmed;
    }

    public static class SessionUser {
        private final int id;
        private final String username;
        private final String role;
        private final String name;
        private final String email;

        public SessionUser(int id, String username, String role, String name, String email) {
            this.id = id;
            this.username = username;
            this.role = role;
            this.name = name;
            this.email = email;
        }

        public int getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getRole() {
            return role;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }
    }
}
