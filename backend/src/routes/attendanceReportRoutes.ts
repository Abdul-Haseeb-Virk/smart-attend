import { Router } from "express";

import {
  getSessionAttendance,
  getCourseAttendance,
  getStudentAttendance,
} from "../controllers/attendanceReportController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

/*
 * Attendance for one session
 *
 * ADMIN and PROFESSOR only
 */
router.get(
  "/session/:sessionId",
  authenticate,
  authorize("ADMIN", "PROFESSOR"),
  getSessionAttendance
);

/*
 * Attendance for an entire course
 *
 * ADMIN and PROFESSOR only
 */
router.get(
  "/course/:courseId",
  authenticate,
  authorize("ADMIN", "PROFESSOR"),
  getCourseAttendance
);

/*
 * Attendance for one student
 *
 * ADMIN, PROFESSOR and STUDENT
 *
 * The controller ensures a STUDENT can only
 * access their own attendance.
 */
router.get(
  "/student/:studentId",
  authenticate,
  authorize("ADMIN", "PROFESSOR", "STUDENT"),
  getStudentAttendance
);

export default router;