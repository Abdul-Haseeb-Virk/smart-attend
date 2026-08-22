import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

type Student = {
  id: number;
  registrationNo: string;
  semester: number;

  user: {
    id: number;
    name: string;
    email: string;
  };

  department: {
    id: number;
    name: string;
    code: string;
  };
};

type Course = {
  id: number;
  code: string;
  name: string;
  creditHours: number;

  department: {
    id: number;
    name: string;
    code: string;
  };

  professor: {
    id: number;
    employeeNo: string;

    user: {
      id: number;
      name: string;
      email: string;
    };
  };
};

type Enrollment = {
  id: number;
  enrolledAt: string;

  student: Student;
  course: Course;
};

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<
    Enrollment[]
  >([]);

  const [students, setStudents] = useState<Student[]>(
    []
  );

  const [courses, setCourses] = useState<Course[]>(
    []
  );

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  /*
   * ==========================================
   * LOAD INITIAL DATA
   * ==========================================
   */

  const loadInitialData = async () => {
    await Promise.all([
      loadEnrollments(),
      loadStudents(),
      loadCourses(),
    ]);
  };

  /*
   * ==========================================
   * LOAD ENROLLMENTS
   * ==========================================
   */

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/enrollments"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.enrollments ?? [];

      setEnrollments(data);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load enrollments"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * LOAD STUDENTS
   * ==========================================
   */

  const loadStudents = async () => {
    try {
      const response = await api.get(
        "/students"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.students ?? [];

      setStudents(data);
    } catch (error) {
      console.error(
        "Failed to load students:",
        error
      );
    }
  };

  /*
   * ==========================================
   * LOAD COURSES
   * ==========================================
   */

  const loadCourses = async () => {
    try {
      const response = await api.get(
        "/courses"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.courses ?? [];

      setCourses(data);
    } catch (error) {
      console.error(
        "Failed to load courses:",
        error
      );
    }
  };

  /*
   * ==========================================
   * RESET FORM
   * ==========================================
   */

  const resetForm = () => {
    setStudentId("");
    setCourseId("");
  };

  /*
   * ==========================================
   * ENROLL STUDENT
   * ==========================================
   */

  const handleEnroll = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!studentId || !courseId) {
      setError(
        "Please select both a student and a course"
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post(
        "/enrollments",
        {
          studentId: Number(studentId),
          courseId: Number(courseId),
        }
      );

      resetForm();

      await loadEnrollments();
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to enroll student"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * DELETE ENROLLMENT
   * ==========================================
   */

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Remove this student from the course?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(
        `/enrollments/${id}`
      );

      await loadEnrollments();
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to remove enrollment"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================
   * FILTER ENROLLMENTS
   * ==========================================
   */

  const filteredEnrollments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return enrollments;
      }

      return enrollments.filter(
        (enrollment) => {
          const studentName =
            enrollment.student.user.name.toLowerCase();

          const registrationNo =
            enrollment.student.registrationNo.toLowerCase();

          const courseCode =
            enrollment.course.code.toLowerCase();

          const courseName =
            enrollment.course.name.toLowerCase();

          const professorName =
            enrollment.course.professor.user.name.toLowerCase();

          return (
            studentName.includes(query) ||
            registrationNo.includes(query) ||
            courseCode.includes(query) ||
            courseName.includes(query) ||
            professorName.includes(query)
          );
        }
      );
    }, [enrollments, search]);

  /*
   * ==========================================
   * STATISTICS
   * ==========================================
   */

  const uniqueStudents =
    new Set(
      enrollments.map(
        (enrollment) =>
          enrollment.student.id
      )
    ).size;

  const uniqueCourses =
    new Set(
      enrollments.map(
        (enrollment) =>
          enrollment.course.id
      )
    ).size;

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="admin-layout">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="admin-sidebar">

        <div className="sidebar-logo">
          <h2>SmartAttend</h2>

          <span>
            Admin Panel
          </span>
        </div>

        <nav className="sidebar-nav">

          <a href="/admin">
            Dashboard
          </a>

          <a href="/admin/departments">
            Departments
          </a>

          <a href="/admin/professors">
            Professors
          </a>

          <a href="/admin/students">
            Students
          </a>

          <a href="/admin/courses">
            Courses
          </a>

          <a
            href="/admin/enrollments"
            className="active"
          >
            Enrollments
          </a>

          <a href="/admin/reports">
            Reports
          </a>

        </nav>

      </aside>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>
            <h1>
              Enrollments
            </h1>

            <p>
              Manage student course
              registrations
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                boxShadow:
                  "0 8px 20px rgba(37,99,235,.25)",
              }}
            >
              E
            </div>

            <div>
              <strong>
                Enrollment Manager
              </strong>

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "2px",
                }}
              >
                Academic Management
              </span>
            </div>
          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div className="crud-error">
            {error}
          </div>
        )}

        {/* ======================================
            STATISTICS
        ====================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "18px",
            marginBottom: "25px",
          }}
        >

          <div className="stat-card">

            <div className="stat-icon">
              E
            </div>

            <div>
              <span>
                Total Enrollments
              </span>

              <strong>
                {loading
                  ? "..."
                  : enrollments.length}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              S
            </div>

            <div>
              <span>
                Enrolled Students
              </span>

              <strong>
                {loading
                  ? "..."
                  : uniqueStudents}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              C
            </div>

            <div>
              <span>
                Active Courses
              </span>

              <strong>
                {loading
                  ? "..."
                  : uniqueCourses}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              S
            </div>

            <div>
              <span>
                Available Students
              </span>

              <strong>
                {loading
                  ? "..."
                  : students.length}
              </strong>
            </div>

          </div>

        </section>

        {/* ======================================
            ENROLLMENT FORM
        ====================================== */}

        <section
          className="crud-form-card"
          style={{
            maxWidth: "100%",
            marginBottom: "25px",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "flex-start",
              gap: "20px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <h2
                style={{
                  marginBottom: "6px",
                }}
              >
                Enroll Student
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Assign a student to a
                course
              </p>

            </div>

            <div
              style={{
                padding:
                  "8px 12px",
                borderRadius: "8px",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {students.length} students
              {" • "}
              {courses.length} courses
            </div>

          </div>

          <form
            onSubmit={handleEnroll}
          >

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >

              {/* STUDENT */}

              <div className="form-group">

                <label>
                  Student
                </label>

                <select
                  value={studentId}
                  onChange={(e) =>
                    setStudentId(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select a student
                  </option>

                  {students.map(
                    (student) => (
                      <option
                        key={
                          student.id
                        }
                        value={
                          student.id
                        }
                      >
                        {student.user.name}
                        {" • "}
                        {
                          student.registrationNo
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* COURSE */}

              <div className="form-group">

                <label>
                  Course
                </label>

                <select
                  value={courseId}
                  onChange={(e) =>
                    setCourseId(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select a course
                  </option>

                  {courses.map(
                    (course) => (
                      <option
                        key={
                          course.id
                        }
                        value={
                          course.id
                        }
                      >
                        {course.code}
                        {" • "}
                        {course.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* SELECTED INFORMATION */}

            {(studentId ||
              courseId) && (
              <div
                style={{
                  marginTop: "5px",
                  padding: "15px",
                  borderRadius: "10px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e5e7eb",
                  fontSize: "14px",
                }}
              >

                {studentId && (
                  <div
                    style={{
                      marginBottom:
                        courseId
                          ? "8px"
                          : 0,
                    }}
                  >
                    <strong>
                      Student:
                    </strong>{" "}
                    {
                      students.find(
                        (student) =>
                          student.id ===
                          Number(
                            studentId
                          )
                      )?.user.name
                    }
                  </div>
                )}

                {courseId && (
                  <div>
                    <strong>
                      Course:
                    </strong>{" "}
                    {
                      courses.find(
                        (course) =>
                          course.id ===
                          Number(
                            courseId
                          )
                      )?.code
                    }
                  </div>
                )}

              </div>
            )}

            <div
              className="form-actions"
              style={{
                marginTop: "20px",
              }}
            >

              <button
                type="submit"
                disabled={
                  loading ||
                  !studentId ||
                  !courseId
                }
              >
                {loading
                  ? "Enrolling..."
                  : "Enroll Student"}
              </button>

              {(studentId ||
                courseId) && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    resetForm
                  }
                >
                  Clear
                </button>
              )}

            </div>

          </form>

        </section>

        {/* ======================================
            ENROLLMENT TABLE
        ====================================== */}

        <section
          className="crud-table-card"
        >

          <div
            className="table-header"
            style={{
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>
              <h2>
                Current Enrollments
              </h2>

              <span>
                {filteredEnrollments.length}
                {" "}
                result
                {filteredEnrollments.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >

              {/* SEARCH */}

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search student, course..."
                style={{
                  width: "250px",
                  maxWidth: "100%",
                  padding:
                    "9px 12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />

              <button
                onClick={
                  loadEnrollments
                }
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : "Refresh"}
              </button>

            </div>

          </div>

          {/* LOADING */}

          {loading &&
          enrollments.length === 0 ? (
            <div
              className="empty-message"
            >
              <div
                style={{
                  fontSize: "30px",
                  marginBottom:
                    "10px",
                }}
              >
                ⟳
              </div>

              Loading enrollments...
            </div>
          ) : filteredEnrollments.length ===
            0 ? (

            <div
              className="empty-message"
            >

              <div
                style={{
                  fontSize: "42px",
                  marginBottom:
                    "10px",
                }}
              >
                {search
                  ? "⌕"
                  : "∅"}
              </div>

              <strong
                style={{
                  display: "block",
                  color: "#374151",
                  marginBottom:
                    "5px",
                }}
              >
                {search
                  ? "No matching enrollments"
                  : "No enrollments found"}
              </strong>

              <span>
                {search
                  ? "Try a different search term."
                  : "Enroll a student to see records here."}
              </span>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Registration
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Professor
                    </th>

                    <th>
                      Enrolled
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredEnrollments.map(
                    (
                      enrollment,
                      index
                    ) => (

                      <tr
                        key={
                          enrollment.id
                        }
                      >

                        {/* ID */}

                        <td>
                          <span
                            style={{
                              color:
                                "#9ca3af",
                              fontSize:
                                "13px",
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>

                        {/* STUDENT */}

                        <td>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "10px",
                            }}
                          >

                            <div
                              style={{
                                width:
                                  "36px",
                                height:
                                  "36px",
                                borderRadius:
                                  "10px",
                                background:
                                  "#eff6ff",
                                color:
                                  "#2563eb",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                fontWeight:
                                  700,
                                flexShrink:
                                  0,
                              }}
                            >
                              {enrollment.student.user.name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>

                              <strong
                                style={{
                                  display:
                                    "block",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  enrollment
                                    .student
                                    .user
                                    .name
                                }
                              </strong>

                              <span
                                style={{
                                  color:
                                    "#6b7280",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {
                                  enrollment
                                    .student
                                    .user
                                    .email
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* REGISTRATION */}

                        <td>

                          <span className="code-badge">
                            {
                              enrollment
                                .student
                                .registrationNo
                            }
                          </span>

                        </td>

                        {/* COURSE */}

                        <td>

                          <div>

                            <strong
                              style={{
                                display:
                                  "block",
                              }}
                            >
                              {
                                enrollment
                                  .course
                                  .code
                              }
                            </strong>

                            <span
                              style={{
                                color:
                                  "#6b7280",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {
                                enrollment
                                  .course
                                  .name
                              }
                            </span>

                          </div>

                        </td>

                        {/* PROFESSOR */}

                        <td>

                          <div>

                            <strong
                              style={{
                                display:
                                  "block",
                              }}
                            >
                              {
                                enrollment
                                  .course
                                  .professor
                                  .user
                                  .name
                              }
                            </strong>

                            <span
                              style={{
                                color:
                                  "#6b7280",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {
                                enrollment
                                  .course
                                  .professor
                                  .employeeNo
                              }
                            </span>

                          </div>

                        </td>

                        {/* DATE */}

                        <td>

                          <span
                            style={{
                              fontSize:
                                "13px",
                            }}
                          >
                            {new Date(
                              enrollment.enrolledAt
                            ).toLocaleDateString(
                              undefined,
                              {
                                year:
                                  "numeric",
                                month:
                                  "short",
                                day:
                                  "numeric",
                              }
                            )}
                          </span>

                        </td>

                        {/* DELETE */}

                        <td>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(
                                enrollment.id
                              )
                            }
                            disabled={
                              loading
                            }
                          >
                            Remove
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}