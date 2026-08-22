import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

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
};

type StartAttendanceModalProps = {
  course: Course | null;
  onClose: () => void;
  onStart: (courseId: number, duration: number) => void;
  loading: boolean;
};

function StartAttendanceModal({
  course,
  onClose,
  onStart,
  loading,
}: StartAttendanceModalProps) {
  const [duration, setDuration] = useState(2);

  if (!course) {
    return null;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "22px",
          padding: "30px",
          boxShadow:
            "0 25px 70px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "6px 10px",
                borderRadius: "8px",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              {course.code}
            </div>

            <h2
              style={{
                margin: "12px 0 5px",
                color: "#111827",
                fontSize: "23px",
              }}
            >
              Start Attendance
            </h2>

            <p
              style={{
                margin: 0,
                color: "#667085",
              }}
            >
              {course.name}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f2f4f7",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "20px",
              color: "#475467",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            marginTop: "28px",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 700,
              color: "#344054",
              marginBottom: "10px",
            }}
          >
            Session Duration
          </label>

          <select
            value={duration}
            onChange={(event) =>
              setDuration(Number(event.target.value))
            }
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 14px",
              border: "1px solid #d0d5dd",
              borderRadius: "10px",
              fontSize: "15px",
              background: "#ffffff",
              color: "#101828",
              outline: "none",
            }}
          >
            <option value={1}>1 minute</option>
            <option value={2}>2 minutes</option>
            <option value={3}>3 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
          </select>
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "15px",
            borderRadius: "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#667085",
              lineHeight: 1.6,
            }}
          >
            Students will scan the rotating QR code
            during this session to mark their
            attendance.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "25px",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #d0d5dd",
              background: "#ffffff",
              color: "#344054",
              borderRadius: "10px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 700,
            }}
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onStart(course.id, duration)
            }
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              background: loading
                ? "#93c5fd"
                : "#2563eb",
              color: "#ffffff",
              borderRadius: "10px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: 700,
            }}
          >
            {loading
              ? "Starting..."
              : "Start Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfessorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const [starting, setStarting] =
    useState(false);

  const [downloadingCourseId, setDownloadingCourseId] =
    useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/courses/my-courses"
      );

      setCourses(response.data.courses ?? []);
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

  /*
   * ==========================================
   * FILTER COURSES
   * ==========================================
   */

  const filteredCourses = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      return (
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
          .includes(query)
      );
    });
  }, [courses, search]);

  /*
   * ==========================================
   * START ATTENDANCE
   * ==========================================
   */

  const startAttendance = async (
    courseId: number,
    duration: number
  ) => {
    try {
      setStarting(true);

      const response = await api.post(
        "/attendance-sessions",
        {
          courseId,
          durationMinutes: duration,
        }
      );

      const sessionId =
        response.data.session.id;

      setSelectedCourse(null);

      navigate(
        "/professor/attendance",
        {
          state: {
            sessionId,
          },
        }
      );
    } catch (error: any) {
      console.error(
        "Start attendance error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to start attendance"
      );
    } finally {
      setStarting(false);
    }
  };

  /*
   * ==========================================
   * VIEW ATTENDANCE
   * ==========================================
   */

  const viewAttendance = (
    courseId: number
  ) => {
    navigate(
      "/professor/course-attendance",
      {
        state: {
          courseId,
        },
      }
    );
  };

  /*
   * ==========================================
   * DOWNLOAD CSV
   * ==========================================
   */

  const downloadCSV = async (
    course: Course
  ) => {
    try {
      setDownloadingCourseId(course.id);

      const response = await api.get(
        `/reports/course/${course.id}/csv`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "text/csv",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${course.code}_attendance.csv`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(
        "CSV download error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to download attendance CSV"
      );
    } finally {
      setDownloadingCourseId(null);
    }
  };

  /*
   * ==========================================
   * DASHBOARD
   * ==========================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)",
        color: "#101828",
      }}
    >
      {/* ========================================
          TOP NAVIGATION
          ======================================== */}

      <header
        style={{
          background:
            "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom:
            "1px solid rgba(226,232,240,0.8)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding:
              "18px 28px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* BRAND */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "18px",
                boxShadow:
                  "0 8px 20px rgba(37,99,235,0.25)",
              }}
            >
              SA
            </div>

            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "16px",
                }}
              >
                Smart Attend
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#667085",
                }}
              >
                Attendance Management
              </div>
            </div>
          </div>

          {/* USER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#dbeafe",
                color: "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
              }}
            >
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "P"}
            </div>

            <div
              style={{
                display: "none",
              }}
            >
              <strong>
                {user?.name}
              </strong>
            </div>

            <button
              onClick={logout}
              style={{
                border:
                  "1px solid #e2e8f0",
                background:
                  "#ffffff",
                padding:
                  "9px 15px",
                borderRadius: "9px",
                color: "#475467",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ========================================
          MAIN
          ======================================== */}

      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding:
            "42px 28px 70px",
        }}
      >
        {/* HERO */}

        <section
          style={{
            background:
              "linear-gradient(135deg, #172554, #1e40af 60%, #2563eb)",
            borderRadius: "24px",
            padding:
              "34px",
            color: "#ffffff",
            boxShadow:
              "0 20px 45px rgba(30,64,175,0.2)",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "30px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.8,
                  fontWeight: 700,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.08em",
                  marginBottom:
                    "10px",
                }}
              >
                Professor Portal
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize:
                    "clamp(28px, 4vw, 40px)",
                  lineHeight: 1.1,
                }}
              >
                Welcome back,
                <br />
                {user?.name}
              </h1>

              <p
                style={{
                  margin:
                    "15px 0 0",
                  maxWidth:
                    "560px",
                  color:
                    "rgba(255,255,255,0.8)",
                  lineHeight: 1.6,
                }}
              >
                Manage your courses,
                start attendance
                sessions, review
                student attendance,
                and export reports.
              </p>
            </div>

            <div
              style={{
                minWidth:
                  "180px",
                padding:
                  "20px",
                borderRadius:
                  "16px",
                background:
                  "rgba(255,255,255,0.1)",
                border:
                  "1px solid rgba(255,255,255,0.15)",
                backdropFilter:
                  "blur(10px)",
              }}
            >
              <div
                style={{
                  fontSize:
                    "13px",
                  color:
                    "rgba(255,255,255,0.7)",
                }}
              >
                Assigned Courses
              </div>

              <div
                style={{
                  marginTop:
                    "6px",
                  fontSize:
                    "34px",
                  fontWeight:
                    800,
                }}
              >
                {courses.length}
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  fontSize:
                    "12px",
                  color:
                    "rgba(255,255,255,0.65)",
                }}
              >
                Current teaching load
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            COURSE SECTION HEADER
            ======================================== */}

        <section>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "20px",
              flexWrap:
                "wrap",
              marginBottom:
                "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "24px",
                }}
              >
                My Courses
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#667085",
                }}
              >
                Select a course to
                manage attendance.
              </p>
            </div>

            <button
              onClick={loadCourses}
              disabled={loading}
              style={{
                border:
                  "1px solid #d0d5dd",
                background:
                  "#ffffff",
                color:
                  "#344054",
                padding:
                  "10px 15px",
                borderRadius:
                  "9px",
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  700,
              }}
            >
              {loading
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>

          {/* SEARCH */}

          {!loading &&
            courses.length > 0 && (
              <div
                style={{
                  position:
                    "relative",
                  marginBottom:
                    "24px",
                }}
              >
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search by course code, name, or department..."
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "14px 16px 14px 45px",
                    border:
                      "1px solid #d0d5dd",
                    borderRadius:
                      "12px",
                    background:
                      "#ffffff",
                    outline:
                      "none",
                    fontSize:
                      "14px",
                    color:
                      "#101828",
                    boxShadow:
                      "0 2px 6px rgba(16,24,40,0.03)",
                  }}
                />

                <span
                  style={{
                    position:
                      "absolute",
                    left:
                      "16px",
                    top:
                      "50%",
                    transform:
                      "translateY(-50%)",
                    color:
                      "#98a2b3",
                    fontSize:
                      "18px",
                  }}
                >
                  ⌕
                </span>
              </div>
            )}

          {/* ========================================
              LOADING
              ======================================== */}

          {loading && (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap:
                  "20px",
              }}
            >
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      height:
                        "310px",
                      borderRadius:
                        "18px",
                      background:
                        "#ffffff",
                      border:
                        "1px solid #e5e7eb",
                    }}
                  />
                )
              )}
            </div>
          )}

          {/* ========================================
              ERROR
              ======================================== */}

          {!loading &&
            error && (
              <div
                style={{
                  padding:
                    "25px",
                  background:
                    "#fff7f7",
                  border:
                    "1px solid #fecaca",
                  borderRadius:
                    "16px",
                  color:
                    "#b42318",
                }}
              >
                <strong>
                  Unable to load courses
                </strong>

                <p>
                  {error}
                </p>

                <button
                  onClick={
                    loadCourses
                  }
                  style={{
                    padding:
                      "10px 16px",
                    border:
                      "none",
                    borderRadius:
                      "8px",
                    background:
                      "#dc2626",
                    color:
                      "#ffffff",
                    cursor:
                      "pointer",
                    fontWeight:
                      700,
                  }}
                >
                  Try Again
                </button>
              </div>
            )}

          {/* ========================================
              EMPTY
              ======================================== */}

          {!loading &&
            !error &&
            courses.length ===
              0 && (
              <div
                style={{
                  padding:
                    "65px 30px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "18px",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "50px",
                    marginBottom:
                      "15px",
                  }}
                >
                  📚
                </div>

                <h3>
                  No courses assigned
                </h3>

                <p
                  style={{
                    color:
                      "#667085",
                  }}
                >
                  Your account currently
                  has no assigned courses.
                </p>
              </div>
            )}

          {/* ========================================
              NO SEARCH RESULTS
              ======================================== */}

          {!loading &&
            !error &&
            courses.length >
              0 &&
            filteredCourses.length ===
              0 && (
              <div
                style={{
                  padding:
                    "50px 30px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "18px",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "42px",
                    marginBottom:
                      "12px",
                  }}
                >
                  🔎
                </div>

                <h3>
                  No courses found
                </h3>

                <p
                  style={{
                    color:
                      "#667085",
                  }}
                >
                  Try another course
                  name, code, or
                  department.
                </p>

                <button
                  onClick={() =>
                    setSearch("")
                  }
                  style={{
                    border:
                      "1px solid #d0d5dd",
                    background:
                      "#ffffff",
                    padding:
                      "9px 15px",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer",
                    fontWeight:
                      600,
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}

          {/* ========================================
              COURSE CARDS
              ======================================== */}

          {!loading &&
            !error &&
            filteredCourses.length >
              0 && (
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(330px, 1fr))",
                  gap:
                    "22px",
                }}
              >
                {filteredCourses.map(
                  (course) => (
                    <article
                      key={
                        course.id
                      }
                      style={{
                        background:
                          "#ffffff",
                        border:
                          "1px solid #e5e7eb",
                        borderRadius:
                          "18px",
                        overflow:
                          "hidden",
                        boxShadow:
                          "0 8px 25px rgba(15,23,42,0.05)",
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseEnter={(
                        event
                      ) => {
                        event.currentTarget.style.transform =
                          "translateY(-3px)";

                        event.currentTarget.style.boxShadow =
                          "0 15px 35px rgba(15,23,42,0.09)";
                      }}
                      onMouseLeave={(
                        event
                      ) => {
                        event.currentTarget.style.transform =
                          "translateY(0)";

                        event.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(15,23,42,0.05)";
                      }}
                    >
                      {/* CARD TOP */}

                      <div
                        style={{
                          padding:
                            "24px 24px 20px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap:
                              "15px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "inline-flex",
                              padding:
                                "6px 10px",
                              borderRadius:
                                "7px",
                              background:
                                "#eff6ff",
                              color:
                                "#2563eb",
                              fontSize:
                                "12px",
                              fontWeight:
                                800,
                            }}
                          >
                            {course.code}
                          </div>

                          <span
                            style={{
                              padding:
                                "5px 9px",
                              borderRadius:
                                "20px",
                              background:
                                "#ecfdf3",
                              color:
                                "#027a48",
                              fontSize:
                                "11px",
                              fontWeight:
                                700,
                            }}
                          >
                            Assigned
                          </span>
                        </div>

                        <h3
                          style={{
                            margin:
                              "15px 0 7px",
                            fontSize:
                              "20px",
                            lineHeight:
                              1.3,
                          }}
                        >
                          {course.name}
                        </h3>

                        <p
                          style={{
                            margin:
                              0,
                            color:
                              "#667085",
                            fontSize:
                              "14px",
                          }}
                        >
                          {course.department.name}
                        </p>
                      </div>

                      {/* CARD DETAILS */}

                      <div
                        style={{
                          padding:
                            "0 24px 20px",
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap:
                            "10px",
                        }}
                      >
                        <div
                          style={{
                            padding:
                              "12px",
                            background:
                              "#f8fafc",
                            borderRadius:
                              "10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#667085",
                              marginBottom:
                                "4px",
                            }}
                          >
                            Department
                          </div>

                          <strong
                            style={{
                              fontSize:
                                "14px",
                            }}
                          >
                            {
                              course
                                .department
                                .code
                            }
                          </strong>
                        </div>

                        <div
                          style={{
                            padding:
                              "12px",
                            background:
                              "#f8fafc",
                            borderRadius:
                              "10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#667085",
                              marginBottom:
                                "4px",
                            }}
                          >
                            Credit Hours
                          </div>

                          <strong
                            style={{
                              fontSize:
                                "14px",
                            }}
                          >
                            {
                              course.creditHours
                            }
                          </strong>
                        </div>
                      </div>

                      {/* CARD ACTIONS */}

                      <div
                        style={{
                          padding:
                            "20px 24px 24px",
                          borderTop:
                            "1px solid #f0f2f5",
                        }}
                      >
                        <button
                          onClick={() =>
                            setSelectedCourse(
                              course
                            )
                          }
                          style={{
                            width:
                              "100%",
                            padding:
                              "13px",
                            border:
                              "none",
                            borderRadius:
                              "10px",
                            background:
                              "linear-gradient(135deg, #2563eb, #4f46e5)",
                            color:
                              "#ffffff",
                            cursor:
                              "pointer",
                            fontWeight:
                              800,
                            fontSize:
                              "14px",
                            boxShadow:
                              "0 7px 18px rgba(37,99,235,0.2)",
                          }}
                        >
                          ▶ Start Attendance
                        </button>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "1fr 1fr",
                            gap:
                              "10px",
                            marginTop:
                              "10px",
                          }}
                        >
                          <button
                            onClick={() =>
                              viewAttendance(
                                course.id
                              )
                            }
                            style={{
                              padding:
                                "11px 8px",
                              border:
                                "1px solid #d0d5dd",
                              background:
                                "#ffffff",
                              color:
                                "#344054",
                              borderRadius:
                                "9px",
                              cursor:
                                "pointer",
                              fontWeight:
                                700,
                              fontSize:
                                "12px",
                            }}
                          >
                            View Attendance
                          </button>

                          <button
                            onClick={() =>
                              downloadCSV(
                                course
                              )
                            }
                            disabled={
                              downloadingCourseId ===
                              course.id
                            }
                            style={{
                              padding:
                                "11px 8px",
                              border:
                                "1px solid #d0d5dd",
                              background:
                                downloadingCourseId ===
                                course.id
                                  ? "#f2f4f7"
                                  : "#ffffff",
                              color:
                                "#344054",
                              borderRadius:
                                "9px",
                              cursor:
                                downloadingCourseId ===
                                course.id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                700,
                              fontSize:
                                "12px",
                            }}
                          >
                            {downloadingCourseId ===
                            course.id
                              ? "Preparing..."
                              : "Download CSV"}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </section>
      </main>

      {/* ========================================
          START ATTENDANCE MODAL
          ======================================== */}

      <StartAttendanceModal
        course={selectedCourse}
        onClose={() =>
          !starting &&
          setSelectedCourse(null)
        }
        onStart={
          startAttendance
        }
        loading={starting}
      />
    </div>
  );
}

export default ProfessorDashboard;