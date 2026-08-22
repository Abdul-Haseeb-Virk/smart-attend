import { Router } from "express";

import {
  generateAttendanceQR,
} from "../controllers/qrController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.get(
  "/:sessionId",
  authenticate,
  authorize("PROFESSOR"),
  generateAttendanceQR
);

export default router;