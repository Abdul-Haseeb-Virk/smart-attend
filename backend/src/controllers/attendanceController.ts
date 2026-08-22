import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import crypto from "crypto";

import { prisma } from "../config/prisma";

const ROTATION_SECONDS =
  Number(process.env.QR_ROTATION_SECONDS) || 10;

function createQRSignature(
  sessionToken: string,
  sessionId: number,
  slot: number
) {
  return crypto
    .createHmac("sha256", sessionToken)
    .update(`${sessionId}:${slot}`)
    .digest("hex");
}

function isValidSignature(
  expectedSignature: string,
  actualSignature: string
) {
  try {
    const expected =
      Buffer.from(expectedSignature, "hex");

    const actual =
      Buffer.from(actualSignature, "hex");

    if (expected.length !== actual.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      expected,
      actual
    );
  } catch {
    return false;
  }
}

export const markAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Attendance QR token is required",
      });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    /*
     * Expected format:
     *
     * smartattend://attendance/
     * SESSION_ID/
     * SLOT/
     * SIGNATURE
     */

    const qrPrefix =
      "smartattend://attendance/";

    if (!token.startsWith(qrPrefix)) {
      return res.status(400).json({
        message: "Invalid QR code format",
      });
    }

    const qrPayload =
      token.substring(qrPrefix.length);

    const parts = qrPayload.split("/");

    if (parts.length !== 3) {
      return res.status(400).json({
        message: "Invalid QR code",
      });
    }

    const sessionId = Number(parts[0]);
    const slot = Number(parts[1]);
    const signature = parts[2];

    if (
      Number.isNaN(sessionId) ||
      Number.isNaN(slot) ||
      !signature
    ) {
      return res.status(400).json({
        message: "Invalid QR code",
      });
    }

    /*
     * Find logged-in student.
     */

    const student =
      await prisma.student.findUnique({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    /*
     * Find attendance session.
     */

    const session =
      await prisma.attendanceSession.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          course: true,
          professor: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    if (!session) {
      return res.status(404).json({
        message: "Attendance session not found",
      });
    }

    /*
     * Session must still be active.
     */

    if (!session.isActive) {
      return res.status(400).json({
        message: "Attendance session is inactive",
      });
    }

    /*
     * Check overall attendance session expiry.
     */

    if (new Date() >= session.expiresAt) {
      await prisma.attendanceSession.update({
        where: {
          id: session.id,
        },
        data: {
          isActive: false,
        },
      });

      return res.status(400).json({
        message: "Attendance session has expired",
      });
    }

    /*
     * Calculate the currently valid QR slot.
     */

    const currentSlot = Math.floor(
      Date.now() /
        (ROTATION_SECONDS * 1000)
    );

    /*
     * Accept current slot and immediately
     * previous slot.
     */

    const validSlots = [
      currentSlot,
      currentSlot - 1,
    ];

    if (!validSlots.includes(slot)) {
      return res.status(400).json({
        message: "QR code has expired",
      });
    }

    /*
     * Generate the signature ourselves.
     */

    const expectedSignature =
      createQRSignature(
        session.token,
        session.id,
        slot
      );

    /*
     * Compare QR signature with expected
     * signature.
     */

    const validSignature =
      isValidSignature(
        expectedSignature,
        signature
      );

    if (!validSignature) {
      return res.status(400).json({
        message: "Invalid QR code",
      });
    }

    /*
     * Check enrollment.
     */

    const enrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: session.courseId,
          },
        },
      });

    if (!enrollment) {
      return res.status(403).json({
        message:
          "You are not enrolled in this course",
      });
    }

    /*
     * Prevent duplicate attendance.
     */

    const existingRecord =
      await prisma.attendanceRecord.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: student.id,
          },
        },
      });

    if (existingRecord) {
      return res.status(409).json({
        message:
          "Attendance has already been marked",
        attendance: existingRecord,
      });
    }

    /*
     * Create attendance record.
     */

    const attendance =
      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          status: "PRESENT",
        },
      });

    return res.status(201).json({
      message: "Attendance marked successfully",

      attendance: {
        id: attendance.id,

        status: attendance.status,

        markedAt: attendance.markedAt,

        student: {
          id: student.id,

          name: student.user.name,

          registrationNo:
            student.registrationNo,
        },

        course: {
          id: session.course.id,

          code: session.course.code,

          name: session.course.name,
        },

        professor: {
          name:
            session.professor.user.name,
        },
      },
    });
  } catch (error) {
    console.error(
      "Mark attendance error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};