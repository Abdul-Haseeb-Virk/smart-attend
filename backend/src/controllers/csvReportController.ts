import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { Parser } from "json2csv";

import { prisma } from "../config/prisma";

export const exportCourseAttendanceCSV = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const courseId =
      Number(req.params.courseId);

    if (Number.isNaN(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const userId = req.user!.userId;
    const role = req.user!.role;

    /*
     * --------------------------------------------------
     * PROFESSOR OWNERSHIP CHECK
     * --------------------------------------------------
     */

    if (role === "PROFESSOR") {
      const professor =
        await prisma.professor.findUnique({
          where: {
            userId,
          },
          select: {
            id: true,
          },
        });

      if (!professor) {
        return res.status(403).json({
          message:
            "Professor profile not found",
        });
      }

      const courseOwner =
        await prisma.course.findUnique({
          where: {
            id: courseId,
          },
          select: {
            professorId: true,
          },
        });

      if (!courseOwner) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      if (
        courseOwner.professorId !==
        professor.id
      ) {
        return res.status(403).json({
          message:
            "You can only export attendance for your own courses",
        });
      }
    }

    /*
     * --------------------------------------------------
     * GET COURSE
     * --------------------------------------------------
     */

    const course =
      await prisma.course.findUnique({
        where: {
          id: courseId,
        },
        include: {
          enrollments: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    /*
     * --------------------------------------------------
     * GET ATTENDANCE SESSIONS
     * --------------------------------------------------
     */

    const sessions =
      await prisma.attendanceSession.findMany({
        where: {
          courseId,
        },
        include: {
          attendanceRecords: true,
        },
        orderBy: {
          startedAt: "asc",
        },
      });

    const totalSessions =
      sessions.length;

    /*
     * --------------------------------------------------
     * BUILD CSV DATA
     * --------------------------------------------------
     */

    const rows =
      course.enrollments.map(
        (enrollment) => {
          const student =
            enrollment.student;

          let present = 0;
          let late = 0;

          for (const session of sessions) {
            const record =
              session.attendanceRecords.find(
                (record) =>
                  record.studentId ===
                  student.id
              );

            if (!record) {
              continue;
            }

            if (
              record.status ===
              "PRESENT"
            ) {
              present++;
            }

            if (
              record.status ===
              "LATE"
            ) {
              late++;
            }
          }

          const absent =
            totalSessions -
            present -
            late;

          const attended =
            present + late;

          const attendancePercentage =
            totalSessions === 0
              ? 0
              : (attended /
                  totalSessions) *
                100;

          return {
            "Registration No":
              student.registrationNo,

            "Student Name":
              student.user.name,

            "Total Classes":
              totalSessions,

            Present:
              present,

            Late:
              late,

            Absent:
              absent,

            "Attendance %":
              attendancePercentage.toFixed(
                2
              ),
          };
        }
      );

    /*
     * --------------------------------------------------
     * CONVERT JSON TO CSV
     * --------------------------------------------------
     */

    const parser =
      new Parser({
        fields: [
          "Registration No",
          "Student Name",
          "Total Classes",
          "Present",
          "Late",
          "Absent",
          "Attendance %",
        ],
      });

    const csv =
      parser.parse(rows);

    /*
     * --------------------------------------------------
     * SEND CSV FILE
     * --------------------------------------------------
     */

    const safeCourseCode =
      course.code.replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      );

    const filename =
      `${safeCourseCode}_attendance.csv`;

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment(filename);

    return res.send(csv);
  } catch (error) {
    console.error(
      "Export course attendance CSV error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate attendance CSV",
    });
  }
};