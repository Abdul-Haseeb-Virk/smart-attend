import { Router } from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  getMyCourses,
} from "../controllers/courseController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

// Create a course
// ADMIN only
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createCourse
);

// Get all courses
// ADMIN only
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getCourses
);

// Get courses assigned to the logged-in professor
// PROFESSOR only
router.get(
  "/my-courses",
  authenticate,
  authorize("PROFESSOR"),
  getMyCourses
);

// Get a single course by ID
// ADMIN only
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  getCourseById
);

export default router;