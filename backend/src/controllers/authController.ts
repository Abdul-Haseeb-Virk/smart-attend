import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

/*
 * ==========================================
 * REGISTER STUDENT
 * ==========================================
 */

export const register = async (
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

    /*
     * ==========================================
     * VALIDATE REQUIRED FIELDS
     * ==========================================
     */

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

    /*
     * ==========================================
     * NORMALIZE INPUT
     * ==========================================
     */

    const normalizedName =
      String(name).trim();

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    const normalizedRegistrationNo =
      String(registrationNo).trim();

    const parsedDepartmentId =
      Number(departmentId);

    const parsedSemester =
      Number(semester);

    /*
     * ==========================================
     * BASIC VALIDATION
     * ==========================================
     */

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedRegistrationNo
    ) {
      return res.status(400).json({
        message:
          "Name, email and registration number cannot be empty",
      });
    }

    if (
      parsedDepartmentId <= 0 ||
      Number.isNaN(parsedDepartmentId)
    ) {
      return res.status(400).json({
        message: "Invalid department",
      });
    }

    if (
      parsedSemester <= 0 ||
      parsedSemester > 8 ||
      Number.isNaN(parsedSemester)
    ) {
      return res.status(400).json({
        message:
          "Semester must be between 1 and 8",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    /*
     * ==========================================
     * CHECK EXISTING EMAIL
     * ==========================================
     */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    /*
     * ==========================================
     * CHECK EXISTING REGISTRATION NUMBER
     * ==========================================
     */

    const existingStudent =
      await prisma.student.findUnique({
        where: {
          registrationNo:
            normalizedRegistrationNo,
        },
      });

    if (existingStudent) {
      return res.status(409).json({
        message:
          "A student with this registration number already exists",
      });
    }

    /*
     * ==========================================
     * CHECK DEPARTMENT
     * ==========================================
     */

    const department =
      await prisma.department.findUnique({
        where: {
          id: parsedDepartmentId,
        },
      });

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    /*
     * ==========================================
     * HASH PASSWORD
     * ==========================================
     */

    const passwordHash =
      await bcrypt.hash(
        String(password),
        10
      );

    /*
     * ==========================================
     * CREATE USER + STUDENT
     *
     * Prisma creates both records together.
     * User role is always STUDENT here.
     * ==========================================
     */

    const user =
      await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          passwordHash,
          role: "STUDENT",

          student: {
            create: {
              registrationNo:
                normalizedRegistrationNo,

              departmentId:
                parsedDepartmentId,

              semester:
                parsedSemester,
            },
          },
        },

        include: {
          student: {
            include: {
              department: true,
            },
          },
        },
      });

    /*
     * ==========================================
     * RETURN SUCCESS RESPONSE
     * ==========================================
     */

    return res.status(201).json({
      message:
        "Student registered successfully",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,

        student: user.student
          ? {
              id: user.student.id,

              registrationNo:
                user.student
                  .registrationNo,

              semester:
                user.student.semester,

              department: {
                id:
                  user.student
                    .department.id,

                name:
                  user.student
                    .department.name,

                code:
                  user.student
                    .department.code,
              },
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/*
 * ==========================================
 * LOGIN
 * ==========================================
 */

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    /*
     * ==========================================
     * VALIDATE INPUT
     * ==========================================
     */

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    /*
     * ==========================================
     * FIND USER
     * ==========================================
     */

    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    /*
     * ==========================================
     * VERIFY PASSWORD
     * ==========================================
     */

    const passwordMatches =
      await bcrypt.compare(
        String(password),
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    /*
     * ==========================================
     * GET PROFESSOR PROFILE
     *
     * We need professorId in the JWT
     * because the professor controllers
     * use req.user.professorId.
     * ==========================================
     */

    let professorId:
      | number
      | undefined;

    if (
      user.role === "PROFESSOR"
    ) {
      const professor =
        await prisma.professor.findUnique({
          where: {
            userId: user.id,
          },
        });

      professorId =
        professor?.id;
    }

    /*
     * ==========================================
     * CREATE JWT
     * ==========================================
     */

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        professorId,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    /*
     * ==========================================
     * RETURN LOGIN RESPONSE
     * ==========================================
     */

    return res.json({
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};