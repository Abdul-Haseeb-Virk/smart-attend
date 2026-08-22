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

type Professor = {
  id: number;
  employeeNo: string;
  createdAt: string;

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

export default function Professors() {
  const navigate = useNavigate();

  const [professors, setProfessors] =
    useState<Professor[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeNo, setEmployeeNo] =
    useState("");
  const [departmentId, setDepartmentId] =
    useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProfessors();
    loadDepartments();
  }, []);

  const loadProfessors = async () => {
    try {
      setInitialLoading(true);
      setError("");

      const response = await api.get(
        "/professors"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.professors ?? [];

      setProfessors(data);
    } catch (error: any) {
      console.error(
        "Load professors error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load professors"
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get(
        "/departments"
      );

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

  const filteredProfessors = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return professors;
    }

    return professors.filter(
      (professor) =>
        professor.user.name
          .toLowerCase()
          .includes(query) ||
        professor.user.email
          .toLowerCase()
          .includes(query) ||
        professor.employeeNo
          .toLowerCase()
          .includes(query) ||
        professor.department.name
          .toLowerCase()
          .includes(query) ||
        professor.department.code
          .toLowerCase()
          .includes(query) ||
        String(professor.id).includes(query)
    );
  }, [professors, search]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setEmployeeNo("");
    setDepartmentId("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const professorName = name.trim();
    const professorEmail =
      email.trim();
    const professorEmployeeNo =
      employeeNo.trim();

    if (
      !professorName ||
      !professorEmail ||
      !professorEmployeeNo ||
      !departmentId
    ) {
      setError(
        "Name, email, employee number and department are required"
      );
      return;
    }

    if (
      editingId === null &&
      !password.trim()
    ) {
      setError(
        "Password is required when creating a professor"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingId !== null) {
        await api.put(
          `/professors/${editingId}`,
          {
            name: professorName,
            email: professorEmail,
            employeeNo:
              professorEmployeeNo,
            departmentId:
              Number(departmentId),
          }
        );
      } else {
        await api.post("/professors", {
          name: professorName,
          email: professorEmail,
          password,
          employeeNo:
            professorEmployeeNo,
          departmentId:
            Number(departmentId),
        });
      }

      resetForm();

      await loadProfessors();
    } catch (error: any) {
      console.error(
        "Save professor error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save professor"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (
    professor: Professor
  ) => {
    setEditingId(professor.id);

    setName(professor.user.name);
    setEmail(professor.user.email);
    setEmployeeNo(
      professor.employeeNo
    );
    setDepartmentId(
      String(professor.department.id)
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
    const professor =
      professors.find(
        (item) => item.id === id
      );

    const confirmed = window.confirm(
      `Delete "${professor?.user.name ?? "this professor"}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(
        `/professors/${id}`
      );

      if (editingId === id) {
        resetForm();
      }

      await loadProfessors();
    } catch (error: any) {
      console.error(
        "Delete professor error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete professor"
      );
    } finally {
      setLoading(false);
    }
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
        {/* =====================================================
            SIDEBAR
            ===================================================== */}

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
          {/* LOGO */}

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
                  justifyContent:
                    "center",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #2563eb, #06b6d4)",
                  color: "#ffffff",
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
                    letterSpacing:
                      "1px",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Admin Panel
                </div>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}

          <nav
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "6px",
              marginTop: "25px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              style={navButtonStyle}
            >
              <span
                style={navIconStyle}
              >
                ◈
              </span>
              Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/departments"
                )
              }
              style={navButtonStyle}
            >
              <span
                style={navIconStyle}
              >
                D
              </span>
              Departments
            </button>

            <button
              type="button"
              style={{
                ...navButtonStyle,
                color: "#67e8f9",
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(6,182,212,0.08))",
                border:
                  "1px solid rgba(34,211,238,0.16)",
              }}
            >
              <span
                style={navIconStyle}
              >
                P
              </span>
              Professors
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/students")
              }
              style={navButtonStyle}
            >
              <span
                style={navIconStyle}
              >
                S
              </span>
              Students
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/courses")
              }
              style={navButtonStyle}
            >
              <span
                style={navIconStyle}
              >
                C
              </span>
              Courses
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/enrollments"
                )
              }
              style={navButtonStyle}
            >
              <span
                style={navIconStyle}
              >
                E
              </span>
              Enrollments
            </button>
          </nav>

          {/* SIDEBAR BOTTOM */}

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
                  letterSpacing:
                    "1px",
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
                Professor Management
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

        {/* =====================================================
            MAIN
            ===================================================== */}

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
              maxWidth: "1350px",
              margin: "0 auto",
            }}
          >
            {/* HEADER */}

            <header
              style={{
                display: "flex",
                alignItems:
                  "flex-start",
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
                  Professors
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  Manage professors,
                  accounts and
                  department assignments.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  loadProfessors
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
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  marginBottom:
                    "20px",
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
                    color:
                      "#fca5a5",
                    cursor:
                      "pointer",
                    fontSize:
                      "18px",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* =================================================
                TOP SUMMARY
                ================================================= */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "14px",
                marginBottom:
                  "18px",
              }}
            >
              <SummaryCard
                label="Total Professors"
                value={
                  initialLoading
                    ? "..."
                    : professors.length
                }
                icon="P"
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
                    : filteredProfessors.length
                }
                icon="⌕"
              />
            </section>

            {/* =================================================
                CONTENT
                ================================================= */}

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
              {/* =================================================
                  FORM
                  ================================================= */}

              <div
                style={{
                  padding: "22px",
                  borderRadius:
                    "20px",
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
                    alignItems:
                      "center",
                    gap: "12px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      display:
                        "flex",
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
                        ? "Edit Professor"
                        : "Add Professor"}
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
                        ? "Update professor information"
                        : "Create a new professor account"}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleSubmit
                  }
                >
                  {/* NAME */}

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
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(
                        e
                      ) =>
                        setName(
                          e.target
                            .value
                        )
                      }
                      placeholder="e.g. Ali Ahmed"
                      disabled={
                        loading
                      }
                      style={
                        inputStyle
                      }
                    />
                  </div>

                  {/* EMAIL */}

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
                      Email
                    </label>

                    <input
                      type="email"
                      value={
                        email
                      }
                      onChange={(
                        e
                      ) =>
                        setEmail(
                          e.target
                            .value
                        )
                      }
                      placeholder="professor@example.com"
                      disabled={
                        loading
                      }
                      style={
                        inputStyle
                      }
                    />
                  </div>

                  {/* PASSWORD */}

                  {editingId ===
                    null && (
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
                        Password
                      </label>

                      <input
                        type="password"
                        value={
                          password
                        }
                        onChange={(
                          e
                        ) =>
                          setPassword(
                            e.target
                              .value
                          )
                        }
                        placeholder="Professor login password"
                        disabled={
                          loading
                        }
                        style={
                          inputStyle
                        }
                      />

                      <p
                        style={{
                          margin:
                            "6px 0 0",
                          color:
                            "#475569",
                          fontSize:
                            "10px",
                        }}
                      >
                        Required only
                        when creating
                        a new account.
                      </p>
                    </div>
                  )}

                  {/* EMPLOYEE NUMBER */}

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
                      Employee Number
                    </label>

                    <input
                      type="text"
                      value={
                        employeeNo
                      }
                      onChange={(
                        e
                      ) =>
                        setEmployeeNo(
                          e.target
                            .value
                        )
                      }
                      placeholder="e.g. EMP001"
                      disabled={
                        loading
                      }
                      style={
                        inputStyle
                      }
                    />
                  </div>

                  {/* DEPARTMENT */}

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

                  {/* SUBMIT */}

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
                      ? "Update Professor"
                      : "Add Professor"}
                  </button>

                  {/* CANCEL */}

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

              {/* =================================================
                  PROFESSOR TABLE
                  ================================================= */}

              <div
                style={{
                  minWidth: 0,
                  padding: "22px",
                  borderRadius:
                    "20px",
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
                    display:
                      "flex",
                    alignItems:
                      "flex-start",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    flexWrap:
                      "wrap",
                    marginBottom:
                      "18px",
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
                      All Professors
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
                        filteredProfessors.length
                      }{" "}
                      shown of{" "}
                      {
                        professors.length
                      }{" "}
                      professors
                    </p>
                  </div>

                  {/* SEARCH */}

                  <div
                    style={{
                      position:
                        "relative",
                      width:
                        "min(100%, 280px)",
                    }}
                  >
                    <span
                      style={{
                        position:
                          "absolute",
                        left:
                          "12px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        color:
                          "#64748b",
                        fontSize:
                          "14px",
                      }}
                    >
                      ⌕
                    </span>

                    <input
                      type="search"
                      value={
                        search
                      }
                      onChange={(
                        e
                      ) =>
                        setSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="Search professors..."
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "10px 12px 10px 32px",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        borderRadius:
                          "10px",
                        outline:
                          "none",
                        background:
                          "rgba(255,255,255,0.035)",
                        color:
                          "#e2e8f0",
                        fontSize:
                          "12px",
                      }}
                    />
                  </div>
                </div>

                {/* LOADING */}

                {initialLoading ? (
                  <div
                    style={{
                      padding:
                        "55px 20px",
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "25px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      ◌
                    </div>

                    Loading professors...
                  </div>
                ) : professors.length ===
                  0 ? (
                  <div
                    style={{
                      padding:
                        "55px 20px",
                      textAlign:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "30px",
                        marginBottom:
                          "10px",
                        opacity:
                          0.6,
                      }}
                    >
                      P
                    </div>

                    <div
                      style={{
                        color:
                          "#cbd5e1",
                        fontWeight:
                          700,
                        marginBottom:
                          "5px",
                      }}
                    >
                      No professors yet
                    </div>

                    <div
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "12px",
                      }}
                    >
                      Add your first
                      professor using
                      the form.
                    </div>
                  </div>
                ) : filteredProfessors.length ===
                  0 ? (
                  <div
                    style={{
                      padding:
                        "45px 20px",
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                      fontSize:
                        "13px",
                    }}
                  >
                    No professors match
                    "{search}".
                  </div>
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
                          "850px",
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
                            Professor
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Employee
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Department
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
                        {filteredProfessors.map(
                          (
                            professor
                          ) => (
                            <tr
                              key={
                                professor.id
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
                                    professor.id
                                  }
                                </span>
                              </td>

                              {/* PROFESSOR */}

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
                                    {professor.user.name
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
                                        professor
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
                                        professor
                                          .user
                                          .email
                                      }
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* EMPLOYEE */}

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
                                      "0.5px",
                                  }}
                                >
                                  {
                                    professor.employeeNo
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
                                    professor
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
                                    professor
                                      .department
                                      .code
                                  }
                                </div>
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
                                        professor
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
                                        professor.id
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

      {/* RESPONSIVE */}

      <style>
        {`
          @media (max-width: 1050px) {
            aside {
              display: none !important;
            }

            main {
              padding: 22px 15px !important;
            }
          }

          @media (max-width: 900px) {
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
            letterSpacing:
              "0.7px",
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
   STYLES
   ============================================================ */

const navButtonStyle: CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  border:
    "1px solid transparent",
  borderRadius: "11px",
  background: "transparent",
  color: "#94a3b8",
  textAlign: "left",
  fontWeight: 600,
  cursor: "pointer",
};

const navIconStyle: CSSProperties = {
  display: "inline-flex",
  width: "18px",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 800,
};

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