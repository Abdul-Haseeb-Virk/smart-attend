import { Router } from "express";
import {
  createProfessor,
  getProfessors,
  getProfessorById,
} from "../controllers/professorController";

import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createProfessor
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  getProfessors
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  getProfessorById
);

export default router;