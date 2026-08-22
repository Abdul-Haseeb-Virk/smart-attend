import { Router } from "express";

import {
  enrollStudent,
  getEnrollments,
  getEnrollmentById,
  deleteEnrollment,

} from "../controllers/enrollmentController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  enrollStudent
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getEnrollments
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  getEnrollmentById
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteEnrollment);

export default router;