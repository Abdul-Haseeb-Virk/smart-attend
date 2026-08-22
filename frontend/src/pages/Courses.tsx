import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import api from "../api/api";

type Department = {
  id: number;
  name: string;
  code: string;
};

type Professor = {
  id: number;
  employeeNo: string;

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

export default function Courses() {
  // const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [professorId, setProfessorId] = useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("");
  const [professorFilter, setProfessorFilter] =
    useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  /*
   * =====================================================
   * LOAD INITIAL DATA
   * =====================================================
   */

  const loadInitialData = async () => {
    await Promise.all([
      loadCourses(),
      loadDepartments(),
      loadProfessors(),
    ]);
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.courses ?? [];

      setCourses(data);
    } catch (error: any) {
      console.error(
        "Load courses error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response =
        await api.get("/departments");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.departments ?? [];

      setDepartments(data);
    } catch (error) {
      console.error(
        "Load departments error:",
        error
      );
    }
  };

  const loadProfessors = async () => {
    try {
      const response =
        await api.get("/professors");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.professors ?? [];

      setProfessors(data);
    } catch (error) {
      console.error(
        "Load professors error:",
        error
      );
    }
  };

  /*
   * =====================================================
   * FORM
   * =====================================================
   */

  const resetForm = () => {
    setCode("");
    setName("");
    setCreditHours("");
    setDepartmentId("");
    setProfessorId("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (
      !code.trim() ||
      !name.trim() ||
      !creditHours ||
      !departmentId ||
      !professorId
    ) {
      setError(
        "All course fields are required"
      );

      return;
    }

    const credits = Number(creditHours);

    if (
      Number.isNaN(credits) ||
      credits < 1 ||
      credits > 6
    ) {
      setError(
        "Credit hours must be between 1 and 6"
      );

      return;
    }

    try {
      setLoading(true);

      const courseData = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        creditHours: credits,
        departmentId: Number(departmentId),
        professorId: Number(professorId),
      };

      if (editingId) {
        await api.put(
          `/courses/${editingId}`,
          courseData
        );
      } else {
        await api.post(
          "/courses",
          courseData
        );
      }

      resetForm();

      await loadCourses();
    } catch (error: any) {
      console.error(
        "Save course error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save course"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * EDIT COURSE
   * =====================================================
   */

  const handleEdit = (
    course: Course
  ) => {
    setEditingId(course.id);

    setCode(course.code);
    setName(course.name);

    setCreditHours(
      String(course.creditHours)
    );

    setDepartmentId(
      String(course.department.id)
    );

    setProfessorId(
      String(course.professor.id)
    );

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =====================================================
   * DELETE COURSE
   * =====================================================
   */

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this course?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(
        `/courses/${id}`
      );

      if (editingId === id) {
        resetForm();
      }

      await loadCourses();
    } catch (error: any) {
      console.error(
        "Delete course error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete course"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * FILTER COURSES
   * =====================================================
   */

  const filteredCourses =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return courses.filter(
        (course) => {
          const matchesSearch =
            !query ||
            course.code
              .toLowerCase()
              .includes(query) ||
            course.name
              .toLowerCase()
              .includes(query) ||
            course.department.name
              .toLowerCase()
              .includes(query) ||
            course.department.code
              .toLowerCase()
              .includes(query) ||
            course.professor.user.name
              .toLowerCase()
              .includes(query) ||
            course.professor.employeeNo
              .toLowerCase()
              .includes(query);

          const matchesDepartment =
            !departmentFilter ||
            String(
              course.department.id
            ) === departmentFilter;

          const matchesProfessor =
            !professorFilter ||
            String(
              course.professor.id
            ) === professorFilter;

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesProfessor
          );
        }
      );
    }, [
      courses,
      search,
      departmentFilter,
      professorFilter,
    ]);

  /*
   * =====================================================
   * STATISTICS
   * =====================================================
   */

  const totalCredits =
    courses.reduce(
      (total, course) =>
        total + course.creditHours,
      0
    );

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("");
    setProfessorFilter("");
  };

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="admin-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        <div className="sidebar-logo">

          <div className="sidebar-brand-icon">
            S
          </div>

          <div>
            <h2>SmartAttend</h2>

            <span>
              Admin Panel
            </span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <a
            href="/admin"
          >
            <span>▦</span>
            Dashboard
          </a>

          <a
            href="/admin/departments"
          >
            <span>◈</span>
            Departments
          </a>

          <a
            href="/admin/professors"
          >
            <span>♙</span>
            Professors
          </a>

          <a
            href="/admin/students"
          >
            <span>♟</span>
            Students
          </a>

          <a
            href="/admin/courses"
            className="active"
          >
            <span>▣</span>
            Courses
          </a>

          <a
            href="/admin/enrollments"
          >
            <span>◇</span>
            Enrollments
          </a>

        </nav>

        <div className="sidebar-footer">

          <div className="sidebar-status">

            <span className="status-dot" />

            System Online

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <span className="page-eyebrow">
              ACADEMIC MANAGEMENT
            </span>

            <h1>
              Courses
            </h1>

            <p>
              Create, manage and assign
              university courses.
            </p>

          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadCourses}
            disabled={loading}
          >

            <span>
              ↻
            </span>

            {loading
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div className="crud-error">

            <span className="crud-error-icon">
              !
            </span>

            <div>

              <strong>
                Something went wrong
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="course-stats">

          <div className="course-stat-card">

            <div className="course-stat-icon blue">
              ▣
            </div>

            <div>

              <span>
                Total Courses
              </span>

              <strong>
                {courses.length}
              </strong>

            </div>

          </div>

          <div className="course-stat-card">

            <div className="course-stat-icon purple">
              ◈
            </div>

            <div>

              <span>
                Departments
              </span>

              <strong>
                {departments.length}
              </strong>

            </div>

          </div>

          <div className="course-stat-card">

            <div className="course-stat-icon cyan">
              ♙
            </div>

            <div>

              <span>
                Professors
              </span>

              <strong>
                {professors.length}
              </strong>

            </div>

          </div>

          <div className="course-stat-card">

            <div className="course-stat-icon green">
              +
            </div>

            <div>

              <span>
                Total Credit Hours
              </span>

              <strong>
                {totalCredits}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            MAIN COURSE AREA
        ================================================= */}

        <section className="crud-container">

          {/* =================================================
              CREATE / EDIT FORM
          ================================================= */}

          <div className="crud-form-card">

            <div className="section-heading">

              <div className="section-icon">
                {editingId
                  ? "✎"
                  : "+"}
              </div>

              <div>

                <h2>
                  {editingId
                    ? "Edit Course"
                    : "Add New Course"}
                </h2>

                <p>
                  {editingId
                    ? "Update the course information below."
                    : "Create a course and assign it to a professor."}
                </p>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
            >

              {/* COURSE CODE */}

              <div className="form-group">

                <label>
                  Course Code
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                    )
                  }
                  placeholder="e.g. CS-301"
                  maxLength={30}
                />

              </div>

              {/* COURSE NAME */}

              <div className="form-group">

                <label>
                  Course Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Database Systems"
                  maxLength={100}
                />

              </div>

              {/* CREDIT HOURS */}

              <div className="form-group">

                <label>
                  Credit Hours
                  <span>*</span>
                </label>

                <input
                  type="number"
                  min="1"
                  max="6"
                  value={creditHours}
                  onChange={(e) =>
                    setCreditHours(
                      e.target.value
                    )
                  }
                  placeholder="3"
                />

                <small>
                  Usually between 1
                  and 6 credit hours.
                </small>

              </div>

              {/* DEPARTMENT */}

              <div className="form-group">

                <label>
                  Department
                  <span>*</span>
                </label>

                <select
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {department.name} (
                        {department.code})
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PROFESSOR */}

              <div className="form-group">

                <label>
                  Professor
                  <span>*</span>
                </label>

                <select
                  value={professorId}
                  onChange={(e) =>
                    setProfessorId(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Professor
                  </option>

                  {professors.map(
                    (professor) => (
                      <option
                        key={
                          professor.id
                        }
                        value={
                          professor.id
                        }
                      >
                        {professor.user.name} (
                        {professor.employeeNo})
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* ACTIONS */}

              <div className="form-actions">

                <button
                  type="submit"
                  className="primary-action"
                  disabled={loading}
                >

                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Course"
                    : "Create Course"}

                </button>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={
                      resetForm
                    }
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </div>

          {/* =================================================
              COURSE DIRECTORY
          ================================================= */}

          <div className="crud-table-card">

            <div className="table-header">

              <div>

                <span className="page-eyebrow">
                  COURSE DIRECTORY
                </span>

                <h2>
                  All Courses
                </h2>

                <span>
                  Showing{" "}
                  {
                    filteredCourses.length
                  }{" "}
                  of{" "}
                  {courses.length}{" "}
                  courses
                </span>

              </div>

            </div>

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="course-filters">

              <div className="search-box">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search course, professor, department..."
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

              </div>

              {/* DEPARTMENT FILTER */}

              <select
                value={
                  departmentFilter
                }
                onChange={(e) =>
                  setDepartmentFilter(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Departments
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={
                        department.id
                      }
                      value={
                        department.id
                      }
                    >
                      {department.code}
                    </option>
                  )
                )}

              </select>

              {/* PROFESSOR FILTER */}

              <select
                value={
                  professorFilter
                }
                onChange={(e) =>
                  setProfessorFilter(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Professors
                </option>

                {professors.map(
                  (professor) => (
                    <option
                      key={
                        professor.id
                      }
                      value={
                        professor.id
                      }
                    >
                      {professor.user.name}
                    </option>
                  )
                )}

              </select>

              {(search ||
                departmentFilter ||
                professorFilter) && (
                <button
                  type="button"
                  className="clear-filter-button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear
                </button>
              )}

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading &&
            courses.length === 0 ? (
              <div className="empty-message">

                <div className="loading-spinner" />

                <strong>
                  Loading courses...
                </strong>

                <span>
                  Fetching course
                  information.
                </span>

              </div>

            ) : courses.length === 0 ? (

              /* =================================================
                 NO COURSES
              ================================================= */

              <div className="empty-message">

                <div className="empty-icon">
                  ▣
                </div>

                <strong>
                  No courses found
                </strong>

                <span>
                  Create your first
                  course using the form.
                </span>

              </div>

            ) : filteredCourses.length ===
              0 ? (

              /* =================================================
                 NO FILTER RESULTS
              ================================================= */

              <div className="empty-message">

                <div className="empty-icon">
                  ⌕
                </div>

                <strong>
                  No matching courses
                </strong>

                <span>
                  Try changing your
                  search or filters.
                </span>

                <button
                  type="button"
                  className="clear-filter-button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              /* =================================================
                 COURSE TABLE
              ================================================= */

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Course
                      </th>

                      <th>
                        Credits
                      </th>

                      <th>
                        Department
                      </th>

                      <th>
                        Professor
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredCourses.map(
                      (course) => (

                        <tr
                          key={
                            course.id
                          }
                        >

                          {/* ID */}

                          <td>

                            <span className="id-badge">
                              #
                              {
                                course.id
                              }
                            </span>

                          </td>

                          {/* COURSE */}

                          <td>

                            <div className="course-name-cell">

                              <span className="code-badge">
                                {
                                  course.code
                                }
                              </span>

                              <strong>
                                {
                                  course.name
                                }
                              </strong>

                            </div>

                          </td>

                          {/* CREDITS */}

                          <td>

                            <span className="credit-badge">

                              {
                                course.creditHours
                              }{" "}
                              CH

                            </span>

                          </td>

                          {/* DEPARTMENT */}

                          <td>

                            <div className="department-cell">

                              <strong>
                                {
                                  course
                                    .department
                                    .name
                                }
                              </strong>

                              <span>
                                {
                                  course
                                    .department
                                    .code
                                }
                              </span>

                            </div>

                          </td>

                          {/* PROFESSOR */}

                          <td>

                            <div className="professor-cell">

                              <div className="professor-avatar">

                                {course.professor.user.name
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}

                              </div>

                              <div>

                                <strong>
                                  {
                                    course
                                      .professor
                                      .user
                                      .name
                                  }
                                </strong>

                                <span>
                                  {
                                    course
                                      .professor
                                      .employeeNo
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="table-actions">

                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  handleEdit(
                                    course
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  handleDelete(
                                    course.id
                                  )
                                }
                                disabled={
                                  loading
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}