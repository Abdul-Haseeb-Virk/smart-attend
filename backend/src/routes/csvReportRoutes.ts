import { Router } from "express";

import {
  exportCourseAttendanceCSV,
} from "../controllers/csvReportController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.get(
  "/course/:courseId/csv",
  authenticate,
  authorize("ADMIN", "PROFESSOR"),
  exportCourseAttendanceCSV
);

export default router;