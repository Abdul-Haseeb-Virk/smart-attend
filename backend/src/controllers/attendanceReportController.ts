import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

/*
 * ============================================================
 * GET SESSION ATTENDANCE
 * ============================================================
 *
 * ADMIN:
 *   Can view any session.
 *
 * PROFESSOR:
 *   Can only view sessions belonging to them.
 *
 * STUDENT:
 *   Not allowed by the route middleware.
 *
 * GET /api/attendance/reports/session/:sessionId
 */
export const getSessionAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sessionId = Number(req.params.sessionId);

    if (Number.isNaN(sessionId)) {
      return res.status(400).json({
        message: "Invalid session ID",
      });
    }

    const user = req.user!;

    /*
     * PROFESSOR OWNERSHIP CHECK
     *
     * A professor can only view attendance sessions
     * that belong to that professor.
     */
    if (user.role === "PROFESSOR") {
      const professor = await prisma.professor.findUnique({
        where: {
          userId: user.userId,
        },
        select: {
          id: true,
        },
      });

      if (!professor) {
        return res.status(403).json({
          message: "Professor profile not found",
        });
      }

      const sessionOwner =
        await prisma.attendanceSession.findUnique({
          where: {
            id: sessionId,
          },
          select: {
            professorId: true,
          },
        });

      if (!sessionOwner) {
        return res.status(404).json({
          message: "Attendance session not found",
        });
      }

      if (sessionOwner.professorId !== professor.id) {
        return res.status(403).json({
          message:
            "You can only view your own attendance sessions",
        });
      }
    }

    /*
     * Get the attendance session.
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
              user: true,
            },
          },
          attendanceRecords: {
            include: {
              student: {
                include: {
                  user: true,
                  department: true,
                },
              },
            },
            orderBy: {
              markedAt: "asc",
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
     * Get all students enrolled in this course.
     *
     * This allows us to determine both present and absent
     * students.
     */
    const enrollments =
      await prisma.enrollment.findMany({
        where: {
          courseId: session.courseId,
        },
        include: {
          student: {
            include: {
              user: true,
              department: true,
            },
          },
        },
        orderBy: {
          student: {
            registrationNo: "asc",
          },
        },
      });

    /*
     * Create a lookup map for attendance records.
     */
    const attendanceMap = new Map(
      session.attendanceRecords.map((record) => [
        record.studentId,
        record,
      ])
    );

    /*
     * Build the complete student attendance list.
     */
    const students = enrollments.map((enrollment) => {
      const student = enrollment.student;

      const record = attendanceMap.get(student.id);

      return {
        studentId: student.id,
        registrationNo: student.registrationNo,
        name: student.user.name,
        email: student.user.email,
        department: student.department.name,
        semester: student.semester,

        status: record
          ? record.status
          : "ABSENT",

        markedAt: record
          ? record.markedAt
          : null,
      };
    });

    const totalStudents = students.length;

    const present = students.filter(
      (student) => student.status === "PRESENT"
    ).length;

    const late = students.filter(
      (student) => student.status === "LATE"
    ).length;

    const absent = students.filter(
      (student) => student.status === "ABSENT"
    ).length;

    const attendancePercentage =
      totalStudents === 0
        ? 0
        : Number(
            (((present + late) / totalStudents) * 100).toFixed(
              2
            )
          );

    return res.status(200).json({
      session: {
        id: session.id,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
      },

      course: {
        id: session.course.id,
        code: session.course.code,
        name: session.course.name,
        creditHours: session.course.creditHours,
      },

      professor: {
        id: session.professor.id,
        employeeNo: session.professor.employeeNo,
        name: session.professor.user.name,
      },

      summary: {
        totalStudents,
        present,
        late,
        absent,
        attendancePercentage,
      },

      students,
    });
  } catch (error) {
    console.error(
      "Get session attendance error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get session attendance",
    });
  }
};


/*
 * ============================================================
 * GET COURSE ATTENDANCE
 * ============================================================
 *
 * ADMIN:
 *   Can view any course.
 *
 * PROFESSOR:
 *   Can only view their own course.
 *
 * STUDENT:
 *   Not allowed by the route middleware.
 *
 * GET /api/attendance/reports/course/:courseId
 */
export const getCourseAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const courseId = Number(req.params.courseId);

    if (Number.isNaN(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const user = req.user!;

    /*
     * PROFESSOR OWNERSHIP CHECK
     */
    if (user.role === "PROFESSOR") {
      const professor = await prisma.professor.findUnique({
        where: {
          userId: user.userId,
        },
        select: {
          id: true,
        },
      });

      if (!professor) {
        return res.status(403).json({
          message: "Professor profile not found",
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

      if (courseOwner.professorId !== professor.id) {
        return res.status(403).json({
          message:
            "You can only view attendance for your own courses",
        });
      }
    }

    /*
     * Get course information.
     */
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },

      include: {
        department: true,

        professor: {
          include: {
            user: true,
          },
        },

        enrollments: {
          include: {
            student: {
              include: {
                user: true,
                department: true,
              },
            },
          },

          orderBy: {
            student: {
              registrationNo: "asc",
            },
          },
        },

        attendanceSessions: {
          include: {
            attendanceRecords: true,
          },

          orderBy: {
            startedAt: "asc",
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
     * Total sessions conducted for this course.
     */
    const totalSessions =
      course.attendanceSessions.length;

    /*
     * Build attendance statistics for every student.
     */
    const students = course.enrollments.map(
      (enrollment) => {
        const student = enrollment.student;

        const studentRecords =
          course.attendanceSessions.flatMap(
            (session) =>
              session.attendanceRecords.filter(
                (record) =>
                  record.studentId === student.id
              )
          );

        const present = studentRecords.filter(
          (record) => record.status === "PRESENT"
        ).length;

        const late = studentRecords.filter(
          (record) => record.status === "LATE"
        ).length;

        const attended = present + late;

        const absent =
          totalSessions - attended;

        const attendancePercentage =
          totalSessions === 0
            ? 0
            : Number(
                (
                  (attended / totalSessions) *
                  100
                ).toFixed(2)
              );

        return {
          studentId: student.id,
          registrationNo: student.registrationNo,
          name: student.user.name,
          email: student.user.email,
          department: student.department.name,
          semester: student.semester,

          totalSessions,

          present,
          late,
          absent,

          attendancePercentage,
        };
      }
    );

    /*
     * Overall course statistics.
     */
    const totalStudents = students.length;

    const totalAttendanceMarks =
      students.reduce(
        (total, student) =>
          total +
          student.present +
          student.late,
        0
      );

    const possibleAttendance =
      totalStudents * totalSessions;

    const overallAttendancePercentage =
      possibleAttendance === 0
        ? 0
        : Number(
            (
              (totalAttendanceMarks /
                possibleAttendance) *
              100
            ).toFixed(2)
          );

    const totalPresent = students.reduce(
      (total, student) =>
        total + student.present,
      0
    );

    const totalLate = students.reduce(
      (total, student) =>
        total + student.late,
      0
    );

    const totalAbsent = students.reduce(
      (total, student) =>
        total + student.absent,
      0
    );

    return res.status(200).json({
      course: {
        id: course.id,
        code: course.code,
        name: course.name,
        creditHours: course.creditHours,
      },

      department: {
        id: course.department.id,
        name: course.department.name,
        code: course.department.code,
      },

      professor: {
        id: course.professor.id,
        employeeNo: course.professor.employeeNo,
        name: course.professor.user.name,
      },

      summary: {
        totalStudents,
        totalSessions,

        totalPresent,
        totalLate,
        totalAbsent,

        totalAttendanceMarks,

        overallAttendancePercentage,
      },

      students,
    });
  } catch (error) {
    console.error(
      "Get course attendance error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get course attendance",
    });
  }
};


/*
 * ============================================================
 * GET STUDENT ATTENDANCE
 * ============================================================
 *
 * ADMIN:
 *   Can view any student.
 *
 * PROFESSOR:
 *   Can view student attendance.
 *
 * STUDENT:
 *   Can ONLY view their own attendance.
 *
 * GET /api/attendance/reports/student/:studentId
 */
export const getStudentAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const studentId = Number(req.params.studentId);

    if (Number.isNaN(studentId)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const user = req.user!;

    /*
     * STUDENT OWNERSHIP CHECK
     *
     * A student cannot request another student's
     * attendance by simply changing the studentId
     * in the URL.
     */
    if (user.role === "STUDENT") {
      const studentOwner =
        await prisma.student.findUnique({
          where: {
            id: studentId,
          },

          select: {
            userId: true,
          },
        });

      if (!studentOwner) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      if (studentOwner.userId !== user.userId) {
        return res.status(403).json({
          message:
            "You can only view your own attendance",
        });
      }
    }

    /*
     * Get student information.
     */
    const student =
      await prisma.student.findUnique({
        where: {
          id: studentId,
        },

        include: {
          user: true,
          department: true,

          enrollments: {
            include: {
              course: {
                include: {
                  department: true,
                  professor: {
                    include: {
                      user: true,
                    },
                  },

                  attendanceSessions: {
                    include: {
                      attendanceRecords: {
                        where: {
                          studentId,
                        },
                      },
                    },
                  },
                },
              },
            },

            orderBy: {
              course: {
                code: "asc",
              },
            },
          },

          attendanceRecords: {
            include: {
              session: {
                include: {
                  course: true,
                },
              },
            },

            orderBy: {
              markedAt: "desc",
            },
          },
        },
      });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    /*
     * Build attendance summary for every course.
     */
    const courses = student.enrollments.map(
      (enrollment) => {
        const course = enrollment.course;

        const totalSessions =
          course.attendanceSessions.length;

        let present = 0;
        let late = 0;

        for (
          const session of course.attendanceSessions
        ) {
          const record =
            session.attendanceRecords[0];

          if (!record) {
            continue;
          }

          if (record.status === "PRESENT") {
            present++;
          }

          if (record.status === "LATE") {
            late++;
          }
        }

        const attended = present + late;

        const absent =
          totalSessions - attended;

        const percentage =
          totalSessions === 0
            ? 0
            : Number(
                (
                  (attended /
                    totalSessions) *
                  100
                ).toFixed(2)
              );

        return {
          courseId: course.id,
          code: course.code,
          name: course.name,
          creditHours: course.creditHours,

          professor: {
            id: course.professor.id,
            employeeNo:
              course.professor.employeeNo,
            name: course.professor.user.name,
          },

          totalSessions,

          present,
          late,
          absent,

          attended,

          attendancePercentage:
            percentage,
        };
      }
    );

    /*
     * Overall student attendance.
     */
    const totalSessions =
      courses.reduce(
        (total, course) =>
          total + course.totalSessions,
        0
      );

    const totalPresent =
      courses.reduce(
        (total, course) =>
          total + course.present,
        0
      );

    const totalLate =
      courses.reduce(
        (total, course) =>
          total + course.late,
        0
      );

    const totalAbsent =
      courses.reduce(
        (total, course) =>
          total + course.absent,
        0
      );

    const totalAttended =
      totalPresent + totalLate;

    const overallAttendancePercentage =
      totalSessions === 0
        ? 0
        : Number(
            (
              (totalAttended /
                totalSessions) *
              100
            ).toFixed(2)
          );

    /*
     * Return student attendance report.
     */
    return res.status(200).json({
      student: {
        id: student.id,
        registrationNo:
          student.registrationNo,
        name: student.user.name,
        email: student.user.email,
        department: {
          id: student.department.id,
          name: student.department.name,
          code: student.department.code,
        },
        semester: student.semester,
      },

      summary: {
        totalSessions,

        present: totalPresent,
        late: totalLate,
        absent: totalAbsent,

        attended: totalAttended,

        attendancePercentage:
          overallAttendancePercentage,
      },

      courses,

      attendanceRecords:
        student.attendanceRecords.map(
          (record) => ({
            id: record.id,
            status: record.status,
            markedAt: record.markedAt,

            sessionId:
              record.sessionId,

            course: {
              id:
                record.session.course.id,

              code:
                record.session.course.code,

              name:
                record.session.course.name,
            },
          })
        ),
    });
  } catch (error) {
    console.error(
      "Get student attendance error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get student attendance",
    });
  }
};