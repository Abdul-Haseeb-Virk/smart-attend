import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import crypto from "crypto";
import QRCode from "qrcode";

import { prisma } from "../config/prisma";

const ROTATION_SECONDS =
  Number(process.env.QR_ROTATION_SECONDS) || 10;

function createQRSignature(
  sessionToken: string,
  sessionId: number,
  slot: number
) {
  return crypto
    .createHmac(
      "sha256",
      sessionToken
    )
    .update(
      `${sessionId}:${slot}`
    )
    .digest("hex");
}

export const generateAttendanceQR =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const sessionId =
        Number(
          req.params.sessionId
        );

      if (Number.isNaN(sessionId)) {
        return res.status(400).json({
          message:
            "Invalid session ID",
        });
      }

      const professorId =
        req.user?.professorId;

      if (!professorId) {
        return res.status(403).json({
          message:
            "Professor profile not found",
        });
      }

      const session =
        await prisma.attendanceSession.findUnique(
          {
            where: {
              id: sessionId,
            },
            include: {
              course: true,
            },
          }
        );

      if (!session) {
        return res.status(404).json({
          message:
            "Attendance session not found",
        });
      }

      if (
        session.professorId !==
        professorId
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to access this session",
        });
      }

      if (!session.isActive) {
        return res.status(400).json({
          message:
            "Attendance session is inactive",
        });
      }

      const now = new Date();

      if (
        now >= session.expiresAt
      ) {
        await prisma.attendanceSession.update(
          {
            where: {
              id: session.id,
            },
            data: {
              isActive: false,
            },
          }
        );

        return res.status(400).json({
          message:
            "Attendance session has expired",
        });
      }

      /*
       * Determine the current QR time slot.
       *
       * Example with 10 second rotation:
       *
       * 13:30:00 - 13:30:09 => slot A
       * 13:30:10 - 13:30:19 => slot B
       * 13:30:20 - 13:30:29 => slot C
       */

      const slot =
        Math.floor(
          now.getTime() /
            (ROTATION_SECONDS *
              1000)
        );

      /*
       * Create a signature using the
       * session's private token.
       */

      const signature =
        createQRSignature(
          session.token,
          session.id,
          slot
        );

      /*
       * The actual QR payload.
       *
       * The session token itself is
       * NOT exposed.
       */

      const qrData =
        `smartattend://attendance/` +
        `${session.id}/${slot}/${signature}`;

      const qrImage =
        await QRCode.toDataURL(
          qrData
        );

      const slotStartedAt =
        new Date(
          slot *
            ROTATION_SECONDS *
            1000
        );

      const slotExpiresAt =
        new Date(
          (slot + 1) *
            ROTATION_SECONDS *
            1000
        );

      return res.json({
        message:
          "QR code generated successfully",

        qr: {
          sessionId:
            session.id,

          courseId:
            session.courseId,

          courseCode:
            session.course.code,

          courseName:
            session.course.name,

          data: qrData,

          image: qrImage,

          rotationSeconds:
            ROTATION_SECONDS,

          generatedAt:
            now,

          validFrom:
            slotStartedAt,

          validUntil:
            slotExpiresAt <
            session.expiresAt
              ? slotExpiresAt
              : session.expiresAt,

          sessionExpiresAt:
            session.expiresAt,
        },
      });
    } catch (error) {
      console.error(
        "Generate attendance QR error:",
        error
      );

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  };