import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const enrollStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        message: "Student ID and course ID are required",
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        id: Number(studentId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const course = await prisma.course.findUnique({
      where: {
        id: Number(courseId),
      },
      include: {
        department: true,
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

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (student.departmentId !== course.departmentId) {
      return res.status(400).json({
        message:
          "Student and course must belong to the same department",
      });
    }

    const existingEnrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: Number(studentId),
            courseId: Number(courseId),
          },
        },
      });

    if (existingEnrollment) {
      return res.status(409).json({
        message:
          "Student is already enrolled in this course",
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
      include: {
        student: {
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
        course: {
          include: {
            department: true,
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
        },
      },
    });

    return res.status(201).json({
      message: "Student enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Enroll student error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getEnrollments = async (
  req: Request,
  res: Response
) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: {
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
        course: {
          include: {
            department: true,
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
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getEnrollmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid enrollment ID",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id,
      },
      include: {
        student: {
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
        course: {
          include: {
            department: true,
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
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found",
      });
    }

    return res.json({
      enrollment,
    });
  } catch (error) {
    console.error("Get enrollment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteEnrollment = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid enrollment ID",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id,
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found",
      });
    }

    await prisma.enrollment.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Enrollment removed successfully",
    });
  } catch (error) {
    console.error("Delete enrollment error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};