import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const createStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      registrationNo,
      departmentId,
      semester,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !registrationNo ||
      !departmentId ||
      !semester
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, registration number, department and semester are required",
      });
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "A user with this email already exists",
      });
    }

    const existingStudent =
      await prisma.student.findUnique({
        where: {
          registrationNo,
        },
      });

    if (existingStudent) {
      return res.status(409).json({
        message:
          "A student with this registration number already exists",
      });
    }

    const department =
      await prisma.department.findUnique({
        where: {
          id: Number(departmentId),
        },
      });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 10);

    const student =
      await prisma.$transaction(
        async (transaction) => {
          const user =
            await transaction.user.create({
              data: {
                name,
                email,
                passwordHash,
                role: "STUDENT",
              },
            });

          return transaction.student.create({
            data: {
              userId: user.id,
              registrationNo,
              departmentId:
                Number(departmentId),
              semester: Number(semester),
            },

            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },

              department: true,
            },
          });
        }
      );

    return res.status(201).json({
      message:
        "Student created successfully",
      student,
    });
  } catch (error) {
    console.error(
      "Create student error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getStudents = async (
  req: Request,
  res: Response
) => {
  try {
    const students =
      await prisma.student.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          department: true,
        },

        orderBy: {
          id: "asc",
        },
      });

    return res.json({
      students,
    });
  } catch (error) {
    console.error(
      "Get students error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getStudentById = async (
  req: Request,
  res: Response
) => {
  try {
    const id =
      Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message:
          "Invalid student ID",
      });
    }

    const student =
      await prisma.student.findUnique({
        where: {
          id,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          department: true,

          enrollments: {
            include: {
              course: true,
            },
          },
        },
      });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.json({
      student,
    });
  } catch (error) {
    console.error(
      "Get student error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


/*
 * ============================================================
 * GET CURRENT LOGGED-IN STUDENT
 * ============================================================
 *
 * GET /api/students/me
 *
 * Only STUDENT users can access this endpoint.
 *
 * The student ID is obtained from the authenticated
 * user's userId instead of accepting an ID from the URL.
 */
export const getMyStudentProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }

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
              role: true,
            },
          },

          department: true,

          enrollments: {
            include: {
              course: true,
            },
          },
        },
      });

    if (!student) {
      return res.status(404).json({
        message:
          "Student profile not found",
      });
    }

    return res.json({
      student,
    });
  } catch (error) {
    console.error(
      "Get my student profile error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};