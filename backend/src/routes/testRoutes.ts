import { Router } from "express";
import {
  authenticate,
  AuthRequest,
} from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = Router();

router.get(
  "/protected",
  authenticate,
  (req: AuthRequest, res) => {
    res.json({
      message: "You are authenticated",
      user: req.user,
    });
  }
);

router.get(
  "/admin-only",
  authenticate,
  authorize("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

export default router;