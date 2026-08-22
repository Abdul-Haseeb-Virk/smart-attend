import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const createDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Department name and code are required",
      });
    }

    const existingDepartment = await prisma.department.findFirst({
      where: {
        OR: [
          { name },
          { code },
        ],
      },
    });

    if (existingDepartment) {
      return res.status(409).json({
        message: "Department name or code already exists",
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
      },
    });

    return res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getDepartments = async (
  req: Request,
  res: Response
) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};