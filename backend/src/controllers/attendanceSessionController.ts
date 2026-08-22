import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import crypto from "crypto";

import { prisma } from "../config/prisma";

export const createAttendanceSession = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { courseId, durationMinutes } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
      });
    }

    const professorId = req.user?.professorId;

    if (!professorId) {
      return res.status(403).json({
        message: "Professor profile not found",
      });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: Number(courseId),
      },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.professorId !== professorId) {
      return res.status(403).json({
        message:
          "You are not assigned to this course",
      });
    }

    const existingSession =
      await prisma.attendanceSession.findFirst({
        where: {
          courseId: Number(courseId),
          professorId,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (existingSession) {
      return res.status(409).json({
        message:
          "An active attendance session already exists for this course",
        session: existingSession,
      });
    }

    const minutes =
      Number(durationMinutes) || 2;

    if (minutes < 1 || minutes > 30) {
      return res.status(400).json({
        message:
          "Duration must be between 1 and 30 minutes",
      });
    }

    const token =
      crypto.randomBytes(32).toString("hex");

    const startedAt = new Date();

    const expiresAt = new Date(
      startedAt.getTime() +
        minutes * 60 * 1000
    );

    const session =
      await prisma.attendanceSession.create({
        data: {
          courseId: Number(courseId),
          professorId,
          token,
          startedAt,
          expiresAt,
          isActive: true,
        },
        include: {
          course: true,
          professor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    return res.status(201).json({
      message: "Attendance session started",

      session: {
        id: session.id,
        course: session.course,
        professor: session.professor,
        token: session.token,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Create attendance session error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};