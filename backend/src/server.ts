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

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/professors", professorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.use(
  "/api/attendance-sessions",
  attendanceSessionRoutes
);
app.use("/api/attendance-qr", qrRoutes);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/attendance/reports",
  attendanceReportRoutes
);

app.use(
  "/api/reports",
  csvReportRoutes
);


app.get("/", (req, res) => {
  res.json({
    message: "SmartAttend API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SmartAttend API running on http://0.0.0.0:${PORT}`);
});