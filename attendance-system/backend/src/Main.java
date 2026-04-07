import server.AppServer;

public class Main {
    public static void main(String[] args) {
        int port = 8080;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            try {
                port = Integer.parseInt(envPort);
            } catch (NumberFormatException ignored) {
            }
        }

        try {
            AppServer appServer = new AppServer(port);
            appServer.start();
            System.out.println("AttendEase backend running on http://localhost:" + port);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Failed to start server: " + e.getMessage());
            System.exit(1);
        }
    }
}
