import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

type Department = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
};

export default function Departments() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setInitialLoading(true);
      setError("");

      const response = await api.get("/departments");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.departments ?? [];

      setDepartments(data);
    } catch (error: any) {
      console.error("Load departments error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load departments"
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return departments;
    }

    return departments.filter(
      (department) =>
        department.name.toLowerCase().includes(query) ||
        department.code.toLowerCase().includes(query) ||
        String(department.id).includes(query)
    );
  }, [departments, search]);

  const resetForm = () => {
    setName("");
    setCode("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const departmentName = name.trim();
    const departmentCode = code.trim().toUpperCase();

    if (!departmentName || !departmentCode) {
      setError(
        "Department name and code are required"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingId !== null) {
        await api.put(
          `/departments/${editingId}`,
          {
            name: departmentName,
            code: departmentCode,
          }
        );
      } else {
        await api.post("/departments", {
          name: departmentName,
          code: departmentCode,
        });
      }

      resetForm();
      await loadDepartments();
    } catch (error: any) {
      console.error(
        "Save department error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save department"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (
    department: Department
  ) => {
    setEditingId(department.id);
    setName(department.name);
    setCode(department.code);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    id: number
  ) => {
    const department = departments.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Delete "${department?.name ?? "this department"}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.delete(`/departments/${id}`);

      if (editingId === id) {
        resetForm();
      }

      await loadDepartments();
    } catch (error: any) {
      console.error(
        "Delete department error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete department"
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
        {/* ==========================================
            SIDEBAR
            ========================================== */}

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
              padding: "8px 10px 25px",
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
                    letterSpacing: "1px",
                    textTransform: "uppercase",
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
              flexDirection: "column",
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
              <span style={navIconStyle}>
                ◈
              </span>
              Dashboard
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
              <span style={navIconStyle}>
                D
              </span>
              Departments
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/professors")
              }
              style={navButtonStyle}
            >
              <span style={navIconStyle}>
                P
              </span>
              Professors
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/students")
              }
              style={navButtonStyle}
            >
              <span style={navIconStyle}>
                S
              </span>
              Students
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/courses")
              }
              style={navButtonStyle}
            >
              <span style={navIconStyle}>
                C
              </span>
              Courses
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/enrollments")
              }
              style={navButtonStyle}
            >
              <span style={navIconStyle}>
                E
              </span>
              Enrollments
            </button>
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
                  textTransform: "uppercase",
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
                Department Management
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

        {/* ==========================================
            MAIN
            ========================================== */}

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
              maxWidth: "1250px",
              margin: "0 auto",
            }}
          >
            {/* HEADER */}

            <header
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 12px",
                    marginBottom: "13px",
                    borderRadius: "999px",
                    background:
                      "rgba(37,99,235,0.10)",
                    border:
                      "1px solid rgba(96,165,250,0.16)",
                    color: "#93c5fd",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "1.1px",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#22d3ee",
                      boxShadow:
                        "0 0 10px rgba(34,211,238,0.7)",
                    }}
                  />

                  Administration
                </div>

                <h1
                  style={{
                    margin: "0 0 8px",
                    fontSize: "34px",
                    fontWeight: 850,
                    letterSpacing: "-0.8px",
                  }}
                >
                  Departments
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  Create, update and manage
                  university departments.
                </p>
              </div>

              <button
                type="button"
                onClick={loadDepartments}
                disabled={loading}
                style={{
                  padding: "10px 16px",
                  border:
                    "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "10px",
                  background:
                    "rgba(255,255,255,0.035)",
                  color: "#cbd5e1",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  opacity: loading ? 0.6 : 1,
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
                  justifyContent: "space-between",
                  gap: "15px",
                  marginBottom: "20px",
                  padding: "14px 16px",
                  borderRadius: "13px",
                  background:
                    "rgba(239,68,68,0.08)",
                  border:
                    "1px solid rgba(239,68,68,0.18)",
                  color: "#fca5a5",
                  fontSize: "13px",
                }}
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#fca5a5",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* ==========================================
                CONTENT GRID
                ========================================== */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(280px, 340px) minmax(0, 1fr)",
                gap: "18px",
                alignItems: "start",
              }}
            >
              {/* FORM CARD */}

              <div
                style={{
                  padding: "22px",
                  borderRadius: "20px",
                  background:
                    "rgba(255,255,255,0.045)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(14px)",
                  boxShadow:
                    "0 18px 45px rgba(0,0,0,0.16)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(6,182,212,0.14))",
                      border:
                        "1px solid rgba(96,165,250,0.14)",
                      color: "#67e8f9",
                      fontWeight: 900,
                    }}
                  >
                    {editingId !== null
                      ? "✎"
                      : "+"}
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "17px",
                        fontWeight: 800,
                      }}
                    >
                      {editingId !== null
                        ? "Edit Department"
                        : "Add Department"}
                    </h2>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color: "#64748b",
                        fontSize: "11px",
                      }}
                    >
                      {editingId !== null
                        ? "Update department details"
                        : "Create a new department"}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                >
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <label
                      style={labelStyle}
                    >
                      Department Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Computer Science"
                      disabled={loading}
                      style={inputStyle}
                    />
                  </div>

                  <div
                    style={{
                      marginBottom: "18px",
                    }}
                  >
                    <label
                      style={labelStyle}
                    >
                      Department Code
                    </label>

                    <input
                      type="text"
                      value={code}
                      onChange={(e) =>
                        setCode(
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="e.g. CS"
                      maxLength={10}
                      disabled={loading}
                      style={{
                        ...inputStyle,
                        textTransform:
                          "uppercase",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "none",
                      borderRadius: "11px",
                      background:
                        "linear-gradient(135deg, #2563eb, #0891b2)",
                      color: "#ffffff",
                      cursor: loading
                        ? "not-allowed"
                        : "pointer",
                      opacity: loading
                        ? 0.65
                        : 1,
                      fontWeight: 800,
                      boxShadow:
                        "0 12px 25px rgba(37,99,235,0.18)",
                    }}
                  >
                    {loading
                      ? "Saving..."
                      : editingId !== null
                      ? "Update Department"
                      : "Add Department"}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={
                        resetForm
                      }
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "11px",
                        marginTop: "9px",
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
                      Cancel Editing
                    </button>
                  )}
                </form>
              </div>

              {/* TABLE CARD */}

              <div
                style={{
                  minWidth: 0,
                  padding: "22px",
                  borderRadius: "20px",
                  background:
                    "rgba(255,255,255,0.045)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(14px)",
                  boxShadow:
                    "0 18px 45px rgba(0,0,0,0.16)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 800,
                      }}
                    >
                      All Departments
                    </h2>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color: "#64748b",
                        fontSize: "11px",
                      }}
                    >
                      {filteredDepartments.length}
                      {" "}shown of{" "}
                      {departments.length}
                    </p>
                  </div>

                  <div
                    style={{
                      position:
                        "relative",
                      width:
                        "min(100%, 260px)",
                    }}
                  >
                    <span
                      style={{
                        position:
                          "absolute",
                        left: "12px",
                        top: "50%",
                        transform:
                          "translateY(-50%)",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      ⌕
                    </span>

                    <input
                      type="search"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search departments..."
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "10px 12px 10px 32px",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        borderRadius:
                          "10px",
                        outline: "none",
                        background:
                          "rgba(255,255,255,0.035)",
                        color: "#e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                  </div>
                </div>

                {/* LOADING */}

                {initialLoading ? (
                  <div
                    style={{
                      padding: "55px 20px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "25px",
                        marginBottom: "10px",
                      }}
                    >
                      ◌
                    </div>

                    Loading departments...
                  </div>
                ) : departments.length ===
                  0 ? (
                  <div
                    style={{
                      padding: "55px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "30px",
                        marginBottom: "10px",
                        opacity: 0.6,
                      }}
                    >
                      D
                    </div>

                    <div
                      style={{
                        color: "#cbd5e1",
                        fontWeight: 700,
                        marginBottom: "5px",
                      }}
                    >
                      No departments yet
                    </div>

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      Add your first department
                      using the form.
                    </div>
                  </div>
                ) : filteredDepartments.length ===
                  0 ? (
                  <div
                    style={{
                      padding: "45px 20px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    No departments match
                    "{search}".
                  </div>
                ) : (
                  <div
                    style={{
                      overflowX: "auto",
                      borderRadius: "13px",
                      border:
                        "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse:
                          "collapse",
                        minWidth: "580px",
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
                            Department
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Code
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
                        {filteredDepartments.map(
                          (department) => (
                            <tr
                              key={
                                department.id
                              }
                              style={{
                                borderTop:
                                  "1px solid rgba(255,255,255,0.055)",
                              }}
                            >
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
                                      "12px",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  #
                                  {
                                    department.id
                                  }
                                </span>
                              </td>

                              <td
                                style={
                                  tableCellStyle
                                }
                              >
                                <div
                                  style={{
                                    color:
                                      "#e2e8f0",
                                    fontWeight:
                                      700,
                                    fontSize:
                                      "13px",
                                  }}
                                >
                                  {
                                    department.name
                                  }
                                </div>

                                <div
                                  style={{
                                    marginTop:
                                      "4px",
                                    color:
                                      "#475569",
                                    fontSize:
                                      "10px",
                                  }}
                                >
                                  Department
                                </div>
                              </td>

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
                                      "0.7px",
                                  }}
                                >
                                  {
                                    department.code
                                  }
                                </span>
                              </td>

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
                                    gap: "7px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleEdit(
                                        department
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
                                        department.id
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
          @media (max-width: 900px) {
            aside {
              display: none !important;
            }

            main {
              padding: 22px 15px !important;
            }
          }

          @media (max-width: 760px) {
            section {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            h1 {
              font-size: 28px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

const navButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  border: "1px solid transparent",
  borderRadius: "11px",
  background: "transparent",
  color: "#94a3b8",
  textAlign: "left",
  fontWeight: 600,
  cursor: "pointer",
};

const navIconStyle: React.CSSProperties = {
  display: "inline-flex",
  width: "18px",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 800,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#94a3b8",
  fontSize: "11px",
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  outline: "none",
  background: "rgba(255,255,255,0.035)",
  color: "#e2e8f0",
  fontSize: "12px",
};

const tableHeaderStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.7px",
  textTransform: "uppercase",
  textAlign: "left",
};

const tableCellStyle: React.CSSProperties = {
  padding: "14px",
  color: "#94a3b8",
  fontSize: "12px",
};