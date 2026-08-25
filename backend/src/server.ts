import express from "express";
import cors from "cors";

import { prisma } from "./config/prisma";

import authRoutes from "./routes/authRoutes";
import testRoutes from "./routes/testRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import professorRoutes from "./routes/professorRoutes";
import studentRoutes from "./routes/studentRoutes";
import courseRoutes from "./routes/courseRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import attendanceSessionRoutes from "./routes/attendanceSessionRoutes";
import qrRoutes from "./routes/qrRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import attendanceReportRoutes from "./routes/attendanceReportRoutes";
import csvReportRoutes from "./routes/csvReportRoutes";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/*
 * ================================
 * AUTHENTICATION
 * ================================
 */

app.use("/api/auth", authRoutes);


/*
 * ================================
 * TEST
 * ================================
 */

app.use("/api/test", testRoutes);


/*
 * ================================
 * ADMIN
 * ================================
 */

app.use("/api/departments", departmentRoutes);

app.use("/api/professors", professorRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/enrollments", enrollmentRoutes);


/*
 * ================================
 * ATTENDANCE
 * ================================
 */

app.use(
  "/api/attendance-sessions",
  attendanceSessionRoutes
);

app.use(
  "/api/attendance-qr",
  qrRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/attendance/reports",
  attendanceReportRoutes
);


/*
 * ================================
 * REPORTS
 * ================================
 */

app.use(
  "/api/reports",
  csvReportRoutes
);


/*
 * ================================
 * ROOT
 * ================================
 */

app.get("/", (req, res) => {
  res.json({
    message: "SmartAttend API is running",
  });
});


/*
 * ================================
 * HEALTH CHECK
 * ================================
 */

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error(
      "Database connection failed:",
      error
    );

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});


/*
 * ================================
 * VERCEL
 * ================================
 *
 * Vercel will execute the Express
 * application as a serverless function.
 */

export default app;