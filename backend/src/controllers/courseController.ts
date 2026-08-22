import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";

import { prisma } from "../config/prisma";

export const createCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      code,
      name,
      creditHours,
      departmentId,
      professorId,
    } = req.body;

    if (
      !code ||
      !name ||
      !creditHours ||
      !departmentId ||
      !professorId
    ) {
      return res.status(400).json({
        message:
          "Code, name, credit hours, department and professor are required",
      });
    }

    const existingCourse =
      await prisma.course.findUnique({
        where: {
          code,
        },
      });

    if (existingCourse) {
      return res.status(409).json({
        message:
          "A course with this code already exists",
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

    const professor =
      await prisma.professor.findUnique({
        where: {
          id: Number(professorId),
        },
      });

    if (!professor) {
      return res.status(404).json({
        message: "Professor not found",
      });
    }

    if (
      professor.departmentId !==
      Number(departmentId)
    ) {
      return res.status(400).json({
        message:
          "Professor does not belong to the selected department",
      });
    }

    const course =
      await prisma.course.create({
        data: {
          code,
          name,
          creditHours: Number(creditHours),
          departmentId: Number(departmentId),
          professorId: Number(professorId),
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

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error(
      "Create course error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCourses = async (
  req: Request,
  res: Response
) => {
  try {
    const courses =
      await prisma.course.findMany({
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
        orderBy: {
          id: "asc",
        },
      });

    return res.json({
      courses,
    });
  } catch (error) {
    console.error(
      "Get courses error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCourseById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course =
      await prisma.course.findUnique({
        where: {
          id,
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

          enrollments: {
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
            },
          },
        },
      });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json({
      course,
    });
  } catch (error) {
    console.error(
      "Get course error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMyCourses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const professorId =
      req.user?.professorId;

    if (!professorId) {
      return res.status(403).json({
        message: "Professor profile not found",
      });
    }

    const courses =
      await prisma.course.findMany({
        where: {
          professorId,
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

        orderBy: {
          id: "asc",
        },
      });

    return res.json({
      courses,
    });
  } catch (error) {
    console.error(
      "Get professor courses error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};