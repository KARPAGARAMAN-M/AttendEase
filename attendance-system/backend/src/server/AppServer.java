package server;

import com.sun.net.httpserver.HttpServer;
import handlers.AttendanceHandler;
import handlers.LoginHandler;
import handlers.ReportHandler;
import handlers.StudentHandler;
import handlers.TeacherHandler;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class AppServer {
    private final HttpServer server;

    public AppServer(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);

        LoginHandler loginHandler = new LoginHandler();
        StudentHandler studentHandler = new StudentHandler();
        TeacherHandler teacherHandler = new TeacherHandler();
        AttendanceHandler attendanceHandler = new AttendanceHandler();
        ReportHandler reportHandler = new ReportHandler();

        server.createContext("/api/login", loginHandler);
        server.createContext("/api/me", loginHandler);

        server.createContext("/api/students", studentHandler);
        server.createContext("/api/students/", studentHandler);

        server.createContext("/api/teachers", teacherHandler);
        server.createContext("/api/subjects", teacherHandler);
        server.createContext("/api/departments", teacherHandler);

        server.createContext("/api/attendance", attendanceHandler);
        server.createContext("/api/attendance/report", reportHandler);
        server.createContext("/api/attendance/monthly", reportHandler);
        server.createContext("/api/attendance/alert", reportHandler);
        server.createContext("/api/attendance/export/pdf", reportHandler);
        server.createContext("/api/attendance/export/excel", reportHandler);

        server.setExecutor(Executors.newFixedThreadPool(20));
    }

    public void start() {
        server.start();
    }

    public void stop(int delaySeconds) {
        server.stop(delaySeconds);
    }
}
