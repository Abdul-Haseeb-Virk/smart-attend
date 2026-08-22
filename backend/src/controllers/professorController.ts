import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

export const createProfessor = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      employeeNo,
      departmentId,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !employeeNo ||
      !departmentId
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, employee number and department are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const existingProfessor =
      await prisma.professor.findUnique({
        where: {
          employeeNo,
        },
      });

    if (existingProfessor) {
      return res.status(409).json({
        message: "A professor with this employee number already exists",
      });
    }

    const department = await prisma.department.findUnique({
      where: {
        id: Number(departmentId),
      },
    });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const professor = await prisma.$transaction(
      async (transaction) => {
        const user = await transaction.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: "PROFESSOR",
          },
        });

        return transaction.professor.create({
          data: {
            userId: user.id,
            employeeNo,
            departmentId: Number(departmentId),
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
      message: "Professor created successfully",
      professor,
    });
  } catch (error) {
    console.error("Create professor error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getProfessors = async (
  req: Request,
  res: Response
) => {
  try {
    const professors = await prisma.professor.findMany({
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
      professors,
    });
  } catch (error) {
    console.error("Get professors error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getProfessorById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid professor ID",
      });
    }

    const professor = await prisma.professor.findUnique({
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
        courses: true,
      },
    });

    if (!professor) {
      return res.status(404).json({
        message: "Professor not found",
      });
    }

    return res.json({
      professor,
    });
  } catch (error) {
    console.error("Get professor error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};