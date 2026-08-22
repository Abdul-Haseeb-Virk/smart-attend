import { Router } from "express";

import {
  markAttendance,
} from "../controllers/attendanceController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post(
  "/mark",
  authenticate,
  authorize("STUDENT"),
  markAttendance
);

export default router;