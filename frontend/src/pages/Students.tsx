import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

type Department = {
  id: number;
  name: string;
  code: string;
};

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

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>(
    []
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    loadStudents();
    loadDepartments();
  }, []);

  const loadStudents = async () => {
    try {
      setInitialLoading(true);
      setError("");

      const response = await api.get("/students");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.students ?? [];

      setStudents(data);
    } catch (error: any) {
      console.error("Load students error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load students"
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get("/departments");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.departments ?? [];

      setDepartments(data);
    } catch (error) {
      console.error(
        "Failed to load departments:",
        error
      );
    }
  };

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.user.name.toLowerCase().includes(query) ||
        student.user.email.toLowerCase().includes(query) ||
        student.registrationNo.toLowerCase().includes(query) ||
        student.department.name.toLowerCase().includes(query) ||
        student.department.code.toLowerCase().includes(query) ||
        String(student.id).includes(query);

      const matchesSemester =
        !semesterFilter ||
        String(student.semester) === semesterFilter;

      const matchesDepartment =
        !departmentFilter ||
        String(student.department.id) === departmentFilter;

      return (
        matchesSearch &&
        matchesSemester &&
        matchesDepartment
      );
    });
  }, [
    students,
    search,
    semesterFilter,
    departmentFilter,
  ]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRegistrationNo("");
    setDepartmentId("");
    setSemester("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const studentName = name.trim();
    const studentEmail = email.trim();
    const studentRegistrationNo =
      registrationNo.trim();

    if (
      !studentName ||
      !studentEmail ||
      !studentRegistrationNo ||
      !departmentId ||
      !semester
    ) {
      setError(
        "Name, email, registration number, department and semester are required"
      );
      return;
    }

    if (
      editingId === null &&
      !password.trim()
    ) {
      setError(
        "Password is required when creating a student"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingId !== null) {
        await api.put(
          `/students/${editingId}`,
          {
            name: studentName,
            email: studentEmail,
            registrationNo:
              studentRegistrationNo,
            departmentId: Number(
              departmentId
            ),
            semester: Number(semester),
          }
        );
      } else {
        await api.post("/students", {
          name: studentName,
          email: studentEmail,
          password,
          registrationNo:
            studentRegistrationNo,
          departmentId: Number(
            departmentId
          ),
          semester: Number(semester),
        });
      }

      resetForm();
      await loadStudents();
    } catch (error: any) {
      console.error(
        "Save student error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save student"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);

    setName(student.user.name);
    setEmail(student.user.email);
    setRegistrationNo(
      student.registrationNo
    );
    setDepartmentId(
      String(student.department.id)
    );
    setSemester(
      String(student.semester)
    );

    setPassword("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    id: number
  ) => {
    const student = students.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Delete "${student?.user.name ?? "this student"}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(
        `/students/${id}`
      );

      if (editingId === id) {
        resetForm();
      }

      await loadStudents();
    } catch (error: any) {
      console.error(
        "Delete student error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete student"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSemesterFilter("");
    setDepartmentFilter("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 8% 5%, rgba(37,99,235,0.18), transparent 32%), radial-gradient(circle at 92% 90%, rgba(6,182,212,0.10), transparent 32%), #06101e",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
        }}
      >
        {/* SIDEBAR */}

        <aside
          style={{
            width: "245px",
            flexShrink: 0,
            minHeight: "100vh",
            boxSizing: "border-box",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            background:
              "rgba(3,10,20,0.72)",
            borderRight:
              "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              padding:
                "8px 10px 25px",
              borderBottom:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #2563eb, #06b6d4)",
                  fontWeight: 900,
                  boxShadow:
                    "0 10px 30px rgba(37,99,235,0.25)",
                }}
              >
                S
              </div>

              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                  }}
                >
                  SmartAttend
                </div>

                <div
                  style={{
                    marginTop: "2px",
                    color: "#64748b",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Admin Panel
                </div>
              </div>
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "25px",
            }}
          >
            <NavButton
              label="Dashboard"
              icon="◈"
              onClick={() =>
                navigate("/admin")
              }
            />

            <NavButton
              label="Departments"
              icon="D"
              onClick={() =>
                navigate(
                  "/admin/departments"
                )
              }
            />

            <NavButton
              label="Professors"
              icon="P"
              onClick={() =>
                navigate(
                  "/admin/professors"
                )
              }
            />

            <NavButton
              label="Students"
              icon="S"
              active
            />

            <NavButton
              label="Courses"
              icon="C"
              onClick={() =>
                navigate(
                  "/admin/courses"
                )
              }
            />

            <NavButton
              label="Enrollments"
              icon="E"
              onClick={() =>
                navigate(
                  "/admin/enrollments"
                )
              }
            />
          </nav>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "20px",
            }}
          >
            <div
              style={{
                padding: "14px",
                marginBottom: "12px",
                borderRadius: "14px",
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform:
                    "uppercase",
                }}
              >
                Current section
              </div>

              <div
                style={{
                  marginTop: "6px",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Student Management
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              style={{
                width: "100%",
                padding: "11px 13px",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                borderRadius: "11px",
                background:
                  "rgba(255,255,255,0.035)",
                color: "#94a3b8",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </aside>

        {/* MAIN */}

        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: "30px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            {/* HEADER */}

            <header
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent:
                  "space-between",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <div>
                <div
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: "8px",
                    padding:
                      "7px 12px",
                    marginBottom:
                      "13px",
                    borderRadius:
                      "999px",
                    background:
                      "rgba(37,99,235,0.10)",
                    border:
                      "1px solid rgba(96,165,250,0.16)",
                    color: "#93c5fd",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing:
                      "1.1px",
                    textTransform:
                      "uppercase",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius:
                        "50%",
                      background:
                        "#22d3ee",
                      boxShadow:
                        "0 0 10px rgba(34,211,238,0.7)",
                    }}
                  />

                  Administration
                </div>

                <h1
                  style={{
                    margin:
                      "0 0 8px",
                    fontSize: "34px",
                    fontWeight: 850,
                    letterSpacing:
                      "-0.8px",
                  }}
                >
                  Students
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  Manage students,
                  academic records and
                  department assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  loadStudents
                }
                disabled={loading}
                style={{
                  padding:
                    "10px 16px",
                  border:
                    "1px solid rgba(255,255,255,0.09)",
                  borderRadius:
                    "10px",
                  background:
                    "rgba(255,255,255,0.035)",
                  color: "#cbd5e1",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  opacity: loading
                    ? 0.6
                    : 1,
                  fontWeight: 700,
                }}
              >
                ↻ Refresh
              </button>
            </header>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  marginBottom: "20px",
                  padding:
                    "14px 16px",
                  borderRadius:
                    "13px",
                  background:
                    "rgba(239,68,68,0.08)",
                  border:
                    "1px solid rgba(239,68,68,0.18)",
                  color: "#fca5a5",
                  fontSize: "13px",
                }}
              >
                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#fca5a5",
                    cursor:
                      "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* SUMMARY */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: "14px",
                marginBottom:
                  "18px",
              }}
            >
              <SummaryCard
                label="Total Students"
                value={
                  initialLoading
                    ? "..."
                    : students.length
                }
                icon="S"
              />

              <SummaryCard
                label="Departments"
                value={
                  initialLoading
                    ? "..."
                    : departments.length
                }
                icon="D"
              />

              <SummaryCard
                label="Showing"
                value={
                  initialLoading
                    ? "..."
                    : filteredStudents.length
                }
                icon="⌕"
              />

              <SummaryCard
                label="Semesters"
                value="8"
                icon="8"
              />
            </section>

            {/* CONTENT */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(280px, 350px) minmax(0, 1fr)",
                gap: "18px",
                alignItems:
                  "start",
              }}
            >
              {/* FORM */}

              <div
                style={{
                  padding: "22px",
                  borderRadius: "20px",
                  background:
                    "rgba(255,255,255,0.045)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  backdropFilter:
                    "blur(14px)",
                  boxShadow:
                    "0 18px 45px rgba(0,0,0,0.16)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      borderRadius:
                        "12px",
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(6,182,212,0.14))",
                      border:
                        "1px solid rgba(96,165,250,0.14)",
                      color: "#67e8f9",
                      fontWeight: 900,
                    }}
                  >
                    {editingId !==
                    null
                      ? "✎"
                      : "+"}
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize:
                          "17px",
                        fontWeight:
                          800,
                      }}
                    >
                      {editingId !==
                      null
                        ? "Edit Student"
                        : "Add Student"}
                    </h2>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color:
                          "#64748b",
                        fontSize:
                          "11px",
                      }}
                    >
                      {editingId !==
                      null
                        ? "Update student information"
                        : "Create a new student account"}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleSubmit
                  }
                >
                  <FormInput
                    label="Full Name"
                    value={name}
                    onChange={
                      setName
                    }
                    placeholder="e.g. Haseeb Ahmed"
                    disabled={
                      loading
                    }
                  />

                  <FormInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={
                      setEmail
                    }
                    placeholder="student@example.com"
                    disabled={
                      loading
                    }
                  />

                  {editingId ===
                    null && (
                    <FormInput
                      label="Password"
                      type="password"
                      value={
                        password
                      }
                      onChange={
                        setPassword
                      }
                      placeholder="Student login password"
                      disabled={
                        loading
                      }
                    />
                  )}

                  <FormInput
                    label="Registration Number"
                    value={
                      registrationNo
                    }
                    onChange={
                      setRegistrationNo
                    }
                    placeholder="e.g. 2023-CS-001"
                    disabled={
                      loading
                    }
                  />

                  <div
                    style={{
                      marginBottom:
                        "15px",
                    }}
                  >
                    <label
                      style={
                        labelStyle
                      }
                    >
                      Department
                    </label>

                    <select
                      value={
                        departmentId
                      }
                      onChange={(
                        e
                      ) =>
                        setDepartmentId(
                          e.target
                            .value
                        )
                      }
                      disabled={
                        loading
                      }
                      style={{
                        ...inputStyle,
                        cursor:
                          "pointer",
                      }}
                    >
                      <option
                        value=""
                        style={{
                          background:
                            "#0b1727",
                        }}
                      >
                        Select Department
                      </option>

                      {departments.map(
                        (
                          department
                        ) => (
                          <option
                            key={
                              department.id
                            }
                            value={
                              department.id
                            }
                            style={{
                              background:
                                "#0b1727",
                            }}
                          >
                            {
                              department.name
                            }{" "}
                            (
                            {
                              department.code
                            }
                            )
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div
                    style={{
                      marginBottom:
                        "20px",
                    }}
                  >
                    <label
                      style={
                        labelStyle
                      }
                    >
                      Semester
                    </label>

                    <select
                      value={
                        semester
                      }
                      onChange={(
                        e
                      ) =>
                        setSemester(
                          e.target
                            .value
                        )
                      }
                      disabled={
                        loading
                      }
                      style={{
                        ...inputStyle,
                        cursor:
                          "pointer",
                      }}
                    >
                      <option
                        value=""
                        style={{
                          background:
                            "#0b1727",
                        }}
                      >
                        Select Semester
                      </option>

                      {[1, 2, 3, 4, 5, 6, 7, 8].map(
                        (number) => (
                          <option
                            key={
                              number
                            }
                            value={
                              number
                            }
                            style={{
                              background:
                                "#0b1727",
                            }}
                          >
                            Semester{" "}
                            {number}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "12px",
                      border:
                        "none",
                      borderRadius:
                        "11px",
                      background:
                        "linear-gradient(135deg, #2563eb, #0891b2)",
                      color:
                        "#ffffff",
                      cursor:
                        loading
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        loading
                          ? 0.65
                          : 1,
                      fontWeight:
                        800,
                      boxShadow:
                        "0 12px 25px rgba(37,99,235,0.18)",
                    }}
                  >
                    {loading
                      ? "Saving..."
                      : editingId !==
                        null
                      ? "Update Student"
                      : "Add Student"}
                  </button>

                  {editingId !==
                    null && (
                    <button
                      type="button"
                      onClick={
                        resetForm
                      }
                      disabled={
                        loading
                      }
                      style={{
                        width:
                          "100%",
                        padding:
                          "11px",
                        marginTop:
                          "9px",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        borderRadius:
                          "11px",
                        background:
                          "rgba(255,255,255,0.035)",
                        color:
                          "#94a3b8",
                        cursor:
                          "pointer",
                        fontWeight:
                          700,
                      }}
                    >
                      Cancel Editing
                    </button>
                  )}
                </form>
              </div>

              {/* TABLE */}

              <div
                style={{
                  minWidth: 0,
                  padding: "22px",
                  borderRadius: "20px",
                  background:
                    "rgba(255,255,255,0.045)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  backdropFilter:
                    "blur(14px)",
                  boxShadow:
                    "0 18px 45px rgba(0,0,0,0.16)",
                }}
              >
                {/* TABLE HEADER */}

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "flex-start",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    flexWrap:
                      "wrap",
                    marginBottom:
                      "14px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize:
                          "18px",
                        fontWeight:
                          800,
                      }}
                    >
                      All Students
                    </h2>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color:
                          "#64748b",
                        fontSize:
                          "11px",
                      }}
                    >
                      {
                        filteredStudents.length
                      }{" "}
                      shown of{" "}
                      {students.length}{" "}
                      students
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <input
                      type="search"
                      value={search}
                      onChange={(
                        e
                      ) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="Search students..."
                      style={{
                        ...inputStyle,
                        width:
                          "210px",
                      }}
                    />

                    <select
                      value={
                        departmentFilter
                      }
                      onChange={(
                        e
                      ) =>
                        setDepartmentFilter(
                          e.target
                            .value
                        )
                      }
                      style={{
                        ...inputStyle,
                        width:
                          "145px",
                        cursor:
                          "pointer",
                      }}
                    >
                      <option
                        value=""
                        style={{
                          background:
                            "#0b1727",
                        }}
                      >
                        All Departments
                      </option>

                      {departments.map(
                        (
                          department
                        ) => (
                          <option
                            key={
                              department.id
                            }
                            value={
                              department.id
                            }
                            style={{
                              background:
                                "#0b1727",
                            }}
                          >
                            {
                              department.code
                            }
                          </option>
                        )
                      )}
                    </select>

                    <select
                      value={
                        semesterFilter
                      }
                      onChange={(
                        e
                      ) =>
                        setSemesterFilter(
                          e.target
                            .value
                        )
                      }
                      style={{
                        ...inputStyle,
                        width:
                          "125px",
                        cursor:
                          "pointer",
                      }}
                    >
                      <option
                        value=""
                        style={{
                          background:
                            "#0b1727",
                        }}
                      >
                        All Semesters
                      </option>

                      {[1, 2, 3, 4, 5, 6, 7, 8].map(
                        (number) => (
                          <option
                            key={
                              number
                            }
                            value={
                              number
                            }
                            style={{
                              background:
                                "#0b1727",
                            }}
                          >
                            Sem {number}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* FILTER BAR */}

                {(search ||
                  semesterFilter ||
                  departmentFilter) && (
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap: "10px",
                      marginBottom:
                        "15px",
                      padding:
                        "9px 12px",
                      borderRadius:
                        "10px",
                      background:
                        "rgba(37,99,235,0.06)",
                      border:
                        "1px solid rgba(96,165,250,0.09)",
                    }}
                  >
                    <span
                      style={{
                        color:
                          "#93c5fd",
                        fontSize:
                          "11px",
                      }}
                    >
                      Filters active
                    </span>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          "#67e8f9",
                        cursor:
                          "pointer",
                        fontSize:
                          "11px",
                        fontWeight:
                          700,
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                {/* LOADING */}

                {initialLoading ? (
                  <EmptyState
                    icon="◌"
                    title="Loading students..."
                    description="Fetching student records."
                  />
                ) : students.length ===
                  0 ? (
                  <EmptyState
                    icon="S"
                    title="No students yet"
                    description="Add your first student using the form."
                  />
                ) : filteredStudents.length ===
                  0 ? (
                  <EmptyState
                    icon="⌕"
                    title="No matching students"
                    description={`No students match "${search || "the selected filters"}".`}
                  />
                ) : (
                  <div
                    style={{
                      overflowX:
                        "auto",
                      borderRadius:
                        "13px",
                      border:
                        "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <table
                      style={{
                        width:
                          "100%",
                        borderCollapse:
                          "collapse",
                        minWidth:
                          "900px",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background:
                              "rgba(255,255,255,0.035)",
                          }}
                        >
                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            ID
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Student
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Registration
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Department
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Semester
                          </th>

                          <th
                            style={{
                              ...tableHeaderStyle,
                              textAlign:
                                "right",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredStudents.map(
                          (
                            student
                          ) => (
                            <tr
                              key={
                                student.id
                              }
                              style={{
                                borderTop:
                                  "1px solid rgba(255,255,255,0.055)",
                              }}
                            >
                              {/* ID */}

                              <td
                                style={
                                  tableCellStyle
                                }
                              >
                                <span
                                  style={{
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "11px",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  #
                                  {
                                    student.id
                                  }
                                </span>
                              </td>

                              {/* STUDENT */}

                              <td
                                style={
                                  tableCellStyle
                                }
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap:
                                      "11px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width:
                                        "36px",
                                      height:
                                        "36px",
                                      flexShrink:
                                        0,
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      borderRadius:
                                        "11px",
                                      background:
                                        "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(6,182,212,0.12))",
                                      border:
                                        "1px solid rgba(96,165,250,0.12)",
                                      color:
                                        "#67e8f9",
                                      fontSize:
                                        "13px",
                                      fontWeight:
                                        900,
                                    }}
                                  >
                                    {student.user.name
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div
                                    style={{
                                      minWidth:
                                        0,
                                    }}
                                  >
                                    <div
                                      style={{
                                        color:
                                          "#e2e8f0",
                                        fontWeight:
                                          700,
                                        fontSize:
                                          "12px",
                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {
                                        student
                                          .user
                                          .name
                                      }
                                    </div>

                                    <div
                                      style={{
                                        marginTop:
                                          "4px",
                                        color:
                                          "#64748b",
                                        fontSize:
                                          "10px",
                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {
                                        student
                                          .user
                                          .email
                                      }
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* REGISTRATION */}

                              <td
                                style={
                                  tableCellStyle
                                }
                              >
                                <span
                                  style={{
                                    display:
                                      "inline-flex",
                                    padding:
                                      "5px 9px",
                                    borderRadius:
                                      "7px",
                                    background:
                                      "rgba(34,211,238,0.08)",
                                    border:
                                      "1px solid rgba(34,211,238,0.13)",
                                    color:
                                      "#67e8f9",
                                    fontSize:
                                      "10px",
                                    fontWeight:
                                      800,
                                    letterSpacing:
                                      "0.3px",
                                  }}
                                >
                                  {
                                    student.registrationNo
                                  }
                                </span>
                              </td>

                              {/* DEPARTMENT */}

                              <td
                                style={
                                  tableCellStyle
                                }
                              >
                                <div
                                  style={{
                                    color:
                                      "#cbd5e1",
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  {
                                    student
                                      .department
                                      .name
                                  }
                                </div>

                                <div
                                  style={{
                                    display:
                                      "inline-block",
                                    marginTop:
                                      "4px",
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "10px",
                                  }}
                                >
                                  {
                                    student
                                      .department
                                      .code
                                  }
                                </div>
                              </td>

                              {/* SEMESTER */}

                              <td
                                style={
                                  tableCellStyle
                                }
                              >
                                <span
                                  style={{
                                    display:
                                      "inline-flex",
                                    padding:
                                      "5px 9px",
                                    borderRadius:
                                      "999px",
                                    background:
                                      "rgba(37,99,235,0.09)",
                                    border:
                                      "1px solid rgba(96,165,250,0.13)",
                                    color:
                                      "#93c5fd",
                                    fontSize:
                                      "10px",
                                    fontWeight:
                                      800,
                                  }}
                                >
                                  Sem{" "}
                                  {
                                    student.semester
                                  }
                                </span>
                              </td>

                              {/* ACTIONS */}

                              <td
                                style={{
                                  ...tableCellStyle,
                                  textAlign:
                                    "right",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",
                                    justifyContent:
                                      "flex-end",
                                    gap:
                                      "7px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEdit(
                                        student
                                      )
                                    }
                                    disabled={
                                      loading
                                    }
                                    style={{
                                      padding:
                                        "7px 11px",
                                      border:
                                        "1px solid rgba(96,165,250,0.14)",
                                      borderRadius:
                                        "8px",
                                      background:
                                        "rgba(37,99,235,0.07)",
                                      color:
                                        "#93c5fd",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        student.id
                                      )
                                    }
                                    disabled={
                                      loading
                                    }
                                    style={{
                                      padding:
                                        "7px 11px",
                                      border:
                                        "1px solid rgba(239,68,68,0.14)",
                                      borderRadius:
                                        "8px",
                                      background:
                                        "rgba(239,68,68,0.06)",
                                      color:
                                        "#fca5a5",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        "11px",
                                      fontWeight:
                                        700,
                                    }}
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
          </div>
        </main>
      </div>

      <style>
        {`
          @media (max-width: 1100px) {
            aside {
              display: none !important;
            }

            main {
              padding: 22px 15px !important;
            }
          }

          @media (max-width: 1000px) {
            section {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 700px) {
            h1 {
              font-size: 28px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* ============================================================
   NAVIGATION BUTTON
   ============================================================ */

function NavButton({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 13px",
        border: active
          ? "1px solid rgba(34,211,238,0.16)"
          : "1px solid transparent",
        borderRadius: "11px",
        background: active
          ? "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(6,182,212,0.08))"
          : "transparent",
        color: active
          ? "#67e8f9"
          : "#94a3b8",
        textAlign: "left",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: "18px",
          color: active
            ? "#67e8f9"
            : "#64748b",
          fontSize: "11px",
          fontWeight: 800,
        }}
      >
        {icon}
      </span>

      {label}
    </button>
  );
}

/* ============================================================
   FORM INPUT
   ============================================================ */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        marginBottom: "15px",
      }}
    >
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
      />
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
   ============================================================ */

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "17px",
        borderRadius: "16px",
        background:
          "rgba(255,255,255,0.035)",
        border:
          "1px solid rgba(255,255,255,0.07)",
        backdropFilter:
          "blur(12px)",
      }}
    >
      <div
        style={{
          width: "39px",
          height: "39px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "11px",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(6,182,212,0.10))",
          color: "#67e8f9",
          fontWeight: 900,
          fontSize: "13px",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#64748b",
            fontSize: "10px",
            fontWeight: 700,
            textTransform:
              "uppercase",
            letterSpacing: "0.7px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "3px",
            color: "#e2e8f0",
            fontSize: "21px",
            fontWeight: 850,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: "55px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          margin: "0 auto 13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "14px",
          background:
            "rgba(37,99,235,0.08)",
          border:
            "1px solid rgba(96,165,250,0.10)",
          color: "#67e8f9",
          fontWeight: 900,
          fontSize: "18px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#cbd5e1",
          fontWeight: 700,
          marginBottom: "5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border:
    "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  outline: "none",
  background:
    "rgba(255,255,255,0.035)",
  color: "#e2e8f0",
  fontSize: "12px",
};

const tableHeaderStyle: CSSProperties = {
  padding: "12px 14px",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.7px",
  textTransform: "uppercase",
  textAlign: "left",
};

const tableCellStyle: CSSProperties = {
  padding: "14px",
  color: "#94a3b8",
  fontSize: "12px",
};