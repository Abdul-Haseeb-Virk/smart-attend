import { Router } from "express";
import {
  createDepartment,
  getDepartments,
} from "../controllers/departmentController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createDepartment
);

// router.get(
//   "/",
//   authenticate,
//   authorize("ADMIN"),
//   getDepartments
// );
router.get(
  "/",
  getDepartments
);

export default router;