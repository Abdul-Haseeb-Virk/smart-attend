import { Router } from "express";

import {
  createStudent,
  getStudents,
  getStudentById,
  getMyStudentProfile,
} from "../controllers/studentController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();


/*
 * ============================================================
 * CREATE STUDENT
 * ============================================================
 *
 * ADMIN only
 *
 * POST /api/students
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createStudent
);


/*
 * ============================================================
 * GET ALL STUDENTS
 * ============================================================
 *
 * ADMIN only
 *
 * GET /api/students
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getStudents
);


/*
 * ============================================================
 * GET CURRENT STUDENT
 * ============================================================
 *
 * STUDENT only
 *
 * GET /api/students/me
 *
 * IMPORTANT:
 * This route must come BEFORE /:id.
 */
router.get(
  "/me",
  authenticate,
  authorize("STUDENT"),
  getMyStudentProfile
);


/*
 * ============================================================
 * GET STUDENT BY ID
 * ============================================================
 *
 * ADMIN only
 *
 * GET /api/students/:id
 */
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  getStudentById
);


export default router;