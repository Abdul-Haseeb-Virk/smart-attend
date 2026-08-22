import { Router } from "express";

import {
  createAttendanceSession,
} from "../controllers/attendanceSessionController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("PROFESSOR"),
  createAttendanceSession
);

export default router;