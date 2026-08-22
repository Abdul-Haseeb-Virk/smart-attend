import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

type Stats = {
  departments: number;
  professors: number;
  students: number;
  courses: number;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: string;
  description: string;
  accent: string;
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    departments: 0,
    professors: 0,
    students: 0,
    courses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadStats = async (showInitialLoading = false) => {
    try {
      if (showInitialLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [
        departmentsResponse,
        professorsResponse,
        studentsResponse,
        coursesResponse,
      ] = await Promise.all([
        api.get("/departments"),
        api.get("/professors"),
        api.get("/students"),
        api.get("/courses"),
      ]);

      setStats({
        departments: Array.isArray(departmentsResponse.data)
          ? departmentsResponse.data.length
          : departmentsResponse.data.departments?.length ?? 0,

        professors: Array.isArray(professorsResponse.data)
          ? professorsResponse.data.length
          : professorsResponse.data.professors?.length ?? 0,

        students: Array.isArray(studentsResponse.data)
          ? studentsResponse.data.length
          : studentsResponse.data.students?.length ?? 0,

        courses: Array.isArray(coursesResponse.data)
          ? coursesResponse.data.length
          : coursesResponse.data.courses?.length ?? 0,
      });
    } catch (error: any) {
      console.error(
        "Failed to load dashboard statistics:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard statistics"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const StatCard = ({
    label,
    value,
    icon,
    description,
    accent,
  }: StatCardProps) => {
    return (
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "22px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.045)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.16)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-45px",
            right: "-45px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: accent,
            opacity: 0.08,
            filter: "blur(10px)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "15px",
          }}
        >
          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              {label}
            </div>

            <div
              style={{
                fontSize: "34px",
                lineHeight: 1,
                fontWeight: 800,
                color: "#f8fafc",
              }}
            >
              {loading ? "..." : value}
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              width: "46px",
              height: "46px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "14px",
              background: accent,
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 800,
              boxShadow: `0 10px 25px ${accent}33`,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const ActionCard = ({
    icon,
    title,
    description,
    onClick,
  }: {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          padding: "20px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.035)",
          color: "#ffffff",
          textAlign: "left",
          cursor: "pointer",
          transition:
            "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform =
            "translateY(-3px)";

          event.currentTarget.style.borderColor =
            "rgba(34,211,238,0.25)";

          event.currentTarget.style.background =
            "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform =
            "translateY(0)";

          event.currentTarget.style.borderColor =
            "rgba(255,255,255,0.08)";

          event.currentTarget.style.background =
            "rgba(255,255,255,0.035)";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(6,182,212,0.16))",
              border:
                "1px solid rgba(96,165,250,0.15)",
              color: "#67e8f9",
              fontWeight: 800,
            }}
          >
            {icon}
          </div>

          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 750,
                color: "#f8fafc",
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#64748b",
                lineHeight: 1.5,
              }}
            >
              {description}
            </div>
          </div>

          <span
            style={{
              marginLeft: "auto",
              color: "#64748b",
              fontSize: "18px",
            }}
          >
            →
          </span>
        </div>
      </button>
    );
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
            background: "rgba(3,10,20,0.72)",
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
            {/* DASHBOARD */}

            <button
              type="button"
              onClick={() => navigate("/admin")}
              style={{
                width: "100%",
                padding: "12px 13px",
                border:
                  "1px solid rgba(34,211,238,0.16)",
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.16), rgba(6,182,212,0.08))",
                color: "#67e8f9",
                textAlign: "left",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <span style={{ marginRight: "10px" }}>
                ◈
              </span>
              Dashboard
            </button>

            {/* DEPARTMENTS */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/departments")
              }
              style={navButtonStyle}
            >
              <span style={{ marginRight: "10px" }}>
                D
              </span>
              Departments
            </button>

            {/* PROFESSORS */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/professors")
              }
              style={navButtonStyle}
            >
              <span style={{ marginRight: "10px" }}>
                P
              </span>
              Professors
            </button>

            {/* STUDENTS */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/students")
              }
              style={navButtonStyle}
            >
              <span style={{ marginRight: "10px" }}>
                S
              </span>
              Students
            </button>

            {/* COURSES */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/courses")
              }
              style={navButtonStyle}
            >
              <span style={{ marginRight: "10px" }}>
                C
              </span>
              Courses
            </button>

            {/* ENROLLMENTS */}

            <button
              type="button"
              onClick={() =>
                navigate("/admin/enrollments")
              }
              style={navButtonStyle}
            >
              <span style={{ marginRight: "10px" }}>
                E
              </span>
              Enrollments
            </button>
          </nav>

          {/* SIDEBAR FOOTER */}

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
                Signed in as
              </div>

              <div
                style={{
                  marginTop: "6px",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "11px 13px",
                border:
                  "1px solid rgba(239,68,68,0.15)",
                borderRadius: "11px",
                background:
                  "rgba(239,68,68,0.06)",
                color: "#fca5a5",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ↪ Logout
            </button>
          </div>
        </aside>

        {/* ==========================================
            MAIN CONTENT
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
                  Dashboard
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  Welcome back,{" "}
                  <strong
                    style={{
                      color: "#e2e8f0",
                    }}
                  >
                    {user?.name}
                  </strong>
                  . Here's your system overview.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => loadStats()}
                  disabled={refreshing}
                  style={{
                    padding: "10px 15px",
                    border:
                      "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "10px",
                    background:
                      "rgba(255,255,255,0.035)",
                    color: "#cbd5e1",
                    cursor: refreshing
                      ? "not-allowed"
                      : "pointer",
                    opacity: refreshing ? 0.6 : 1,
                    fontWeight: 600,
                  }}
                >
                  {refreshing
                    ? "Refreshing..."
                    : "↻ Refresh"}
                </button>

                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "13px",
                    background:
                      "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(6,182,212,0.18))",
                    border:
                      "1px solid rgba(96,165,250,0.16)",
                    color: "#67e8f9",
                    fontWeight: 800,
                  }}
                >
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
              </div>
            </header>

            {/* ERROR */}

            {error && (
              <div
                style={{
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
                {error}
              </div>
            )}

            {/* STATS */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "14px",
                marginBottom: "25px",
              }}
            >
              <StatCard
                label="Departments"
                value={stats.departments}
                icon="D"
                description="Academic departments"
                accent="#2563eb"
              />

              <StatCard
                label="Professors"
                value={stats.professors}
                icon="P"
                description="Registered faculty"
                accent="#7c3aed"
              />

              <StatCard
                label="Students"
                value={stats.students}
                icon="S"
                description="Registered students"
                accent="#06b6d4"
              />

              <StatCard
                label="Courses"
                value={stats.courses}
                icon="C"
                description="Available courses"
                accent="#22c55e"
              />
            </section>

            {/* WELCOME PANEL */}

            <section
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "28px",
                marginBottom: "25px",
                borderRadius: "22px",
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(6,182,212,0.055))",
                border:
                  "1px solid rgba(96,165,250,0.12)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "220px",
                  height: "220px",
                  right: "-80px",
                  top: "-110px",
                  borderRadius: "50%",
                  background:
                    "rgba(6,182,212,0.08)",
                  filter: "blur(8px)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    color: "#67e8f9",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  System Overview
                </div>

                <h2
                  style={{
                    margin: "0 0 9px",
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  SmartAttend Administration
                </h2>

                <p
                  style={{
                    maxWidth: "700px",
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: "13px",
                    lineHeight: 1.7,
                  }}
                >
                  Manage your academic structure,
                  professors, students, courses and
                  enrollments from one centralized
                  administration panel.
                </p>
              </div>
            </section>

            {/* QUICK ACTIONS */}

            <section>
              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 5px",
                    fontSize: "20px",
                    fontWeight: 800,
                  }}
                >
                  Quick Actions
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Jump directly to common administrative tasks.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "12px",
                }}
              >
                <ActionCard
                  icon="D"
                  title="Manage Departments"
                  description="Create and manage academic departments."
                  onClick={() =>
                    navigate("/admin/departments")
                  }
                />

                <ActionCard
                  icon="P"
                  title="Manage Professors"
                  description="View and manage professor accounts."
                  onClick={() =>
                    navigate("/admin/professors")
                  }
                />

                <ActionCard
                  icon="S"
                  title="Manage Students"
                  description="View and manage student records."
                  onClick={() =>
                    navigate("/admin/students")
                  }
                />

                <ActionCard
                  icon="C"
                  title="Manage Courses"
                  description="Create and manage course assignments."
                  onClick={() =>
                    navigate("/admin/courses")
                  }
                />

                <ActionCard
                  icon="E"
                  title="Manage Enrollments"
                  description="Manage student course enrollments."
                  onClick={() =>
                    navigate("/admin/enrollments")
                  }
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* RESPONSIVE SIDEBAR */}

      <style>
        {`
          @media (max-width: 850px) {
            aside {
              display: none !important;
            }

            main {
              padding: 22px 15px !important;
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
  transition:
    "background 0.2s ease, color 0.2s ease",
};