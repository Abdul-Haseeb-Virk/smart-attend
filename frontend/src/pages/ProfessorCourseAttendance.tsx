import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "../api/api";

type StudentAttendance = {
  studentId: number;
  registrationNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  attendancePercentage: number;
};

type CourseAttendanceReport = {
  course: {
    id: number;
    code: string;
    name: string;
    creditHours: number;
  };

  department: {
    id: number;
    name: string;
    code: string;
  };

  professor: {
    id: number;
    employeeNo: string;
    name: string;
  };

  summary: {
    totalStudents: number;
    totalSessions: number;
    totalPresent: number;
    totalLate: number;
    totalAbsent: number;
    totalAttendanceMarks: number;
    overallAttendancePercentage: number;
  };

  students: StudentAttendance[];
};

type AttendanceFilter =
  | "ALL"
  | "GOOD"
  | "WARNING"
  | "LOW";

type SortOption =
  | "NAME"
  | "REGISTRATION"
  | "ATTENDANCE_HIGH"
  | "ATTENDANCE_LOW";

function ProfessorCourseAttendance() {
  const location = useLocation();
  const navigate = useNavigate();

  const courseId =
    location.state?.courseId;

  const [report, setReport] =
    useState<CourseAttendanceReport | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<AttendanceFilter>("ALL");

  const [sortBy, setSortBy] =
    useState<SortOption>("NAME");

  useEffect(() => {
    if (!courseId) {
      setError(
        "No course was selected."
      );

      setLoading(false);

      return;
    }

    loadReport();
  }, [courseId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/attendance/reports/course/${courseId}`
      );

      setReport(response.data);
    } catch (error: any) {
      console.error(
        "Load course attendance error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load attendance report"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshReport = async () => {
    try {
      setRefreshing(true);
      setError("");

      const response = await api.get(
        `/attendance/reports/course/${courseId}`
      );

      setReport(response.data);
    } catch (error: any) {
      console.error(
        "Refresh attendance error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to refresh attendance report"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const downloadCSV = async () => {
    if (!courseId || !report) {
      return;
    }

    try {
      setDownloading(true);

      const response = await api.get(
        `/reports/course/${courseId}/csv`,
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
        `${report.course.code}_attendance.csv`;

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
          "Failed to download CSV"
      );
    } finally {
      setDownloading(false);
    }
  };

  /*
   * ==========================================
   * FILTER + SEARCH + SORT
   * ==========================================
   */

  const filteredStudents = useMemo(() => {
    if (!report) {
      return [];
    }

    const query =
      search.trim().toLowerCase();

    const result =
      report.students.filter(
        (student) => {
          const matchesSearch =
            !query ||
            student.name
              .toLowerCase()
              .includes(query) ||
            student.registrationNo
              .toLowerCase()
              .includes(query) ||
            student.email
              .toLowerCase()
              .includes(query);

          let matchesFilter = true;

          if (filter === "GOOD") {
            matchesFilter =
              student.attendancePercentage >=
              75;
          }

          if (filter === "WARNING") {
            matchesFilter =
              student.attendancePercentage >=
                60 &&
              student.attendancePercentage < 75;
          }

          if (filter === "LOW") {
            matchesFilter =
              student.attendancePercentage < 60;
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    return [...result].sort(
      (a, b) => {
        switch (sortBy) {
          case "REGISTRATION":
            return a.registrationNo.localeCompare(
              b.registrationNo
            );

          case "ATTENDANCE_HIGH":
            return (
              b.attendancePercentage -
              a.attendancePercentage
            );

          case "ATTENDANCE_LOW":
            return (
              a.attendancePercentage -
              b.attendancePercentage
            );

          case "NAME":
          default:
            return a.name.localeCompare(
              b.name
            );
        }
      }
    );
  }, [
    report,
    search,
    filter,
    sortBy,
  ]);

  /*
   * ==========================================
   * ATTENDANCE HEALTH
   * ==========================================
   */

  const attendanceHealth =
    report &&
    report.summary.overallAttendancePercentage >=
      75
      ? "Healthy"
      : report &&
        report.summary
          .overallAttendancePercentage >= 60
      ? "Needs Attention"
      : "Critical";

  /*
   * ==========================================
   * LOADING SCREEN
   * ==========================================
   */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f8fafc, #eef2ff)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              height: "36px",
              width: "280px",
              background: "#e2e8f0",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          />

          <div
            style={{
              height: "20px",
              width: "420px",
              background: "#e2e8f0",
              borderRadius: "8px",
              marginBottom: "35px",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    height: "120px",
                    background: "white",
                    borderRadius: "18px",
                    border:
                      "1px solid #e2e8f0",
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * ERROR SCREEN
   * ==========================================
   */

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f8fafc, #eef2ff)",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "#ffffff",
            border:
              "1px solid #fee2e2",
            borderRadius: "20px",
            padding: "40px",
            textAlign: "center",
            boxShadow:
              "0 20px 50px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            !
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#0f172a",
            }}
          >
            Unable to load report
          </h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "25px",
            }}
          >
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/professor")
            }
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "12px 20px",
              background: "#0f172a",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const percentage = Math.min(
    100,
    Math.max(
      0,
      report.summary
        .overallAttendancePercentage
    )
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "30px 20px 60px",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* ==========================================
            HEADER
            ========================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <button
              onClick={() =>
                navigate("/professor")
              }
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                color: "#64748b",
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              ← Back to Dashboard
            </button>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                letterSpacing: "-0.8px",
              }}
            >
              Course Attendance
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  padding:
                    "6px 10px",
                  borderRadius: "8px",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {report.course.code}
              </span>

              <span
                style={{
                  color: "#64748b",
                }}
              >
                {report.course.name}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={refreshReport}
              disabled={refreshing}
              style={{
                border:
                  "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                borderRadius: "10px",
                padding: "11px 16px",
                cursor: refreshing
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 600,
                opacity: refreshing
                  ? 0.7
                  : 1,
              }}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              onClick={downloadCSV}
              disabled={downloading}
              style={{
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                borderRadius: "10px",
                padding: "11px 18px",
                cursor: downloading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 600,
                opacity: downloading
                  ? 0.7
                  : 1,
              }}
            >
              {downloading
                ? "Preparing..."
                : "↓ Download CSV"}
            </button>
          </div>
        </div>

        {/* ==========================================
            COURSE INFORMATION
            ========================================== */}

        <div
          style={{
            background:
              "rgba(255,255,255,0.85)",
            border:
              "1px solid rgba(148,163,184,0.25)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.05)",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                textTransform:
                  "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              Department
            </div>

            <strong>
              {report.department.name}
            </strong>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginTop: "3px",
              }}
            >
              {report.department.code}
            </div>
          </div>

          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                textTransform:
                  "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              Professor
            </div>

            <strong>
              {report.professor.name}
            </strong>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginTop: "3px",
              }}
            >
              {report.professor.employeeNo}
            </div>
          </div>

          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                textTransform:
                  "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              Credit Hours
            </div>

            <strong
              style={{
                fontSize: "20px",
              }}
            >
              {report.course.creditHours}
            </strong>
          </div>

          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                textTransform:
                  "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              Attendance Health
            </div>

            <strong
              style={{
                color:
                  attendanceHealth ===
                  "Healthy"
                    ? "#16a34a"
                    : attendanceHealth ===
                        "Needs Attention"
                    ? "#d97706"
                    : "#dc2626",
              }}
            >
              {attendanceHealth}
            </strong>
          </div>
        </div>

        {/* ==========================================
            SUMMARY CARDS
            ========================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              label: "Students",
              value:
                report.summary
                  .totalStudents,
              icon: "👥",
            },
            {
              label: "Sessions",
              value:
                report.summary
                  .totalSessions,
              icon: "📚",
            },
            {
              label: "Present",
              value:
                report.summary
                  .totalPresent,
              icon: "✓",
            },
            {
              label: "Late",
              value:
                report.summary
                  .totalLate,
              icon: "◷",
            },
            {
              label: "Absent",
              value:
                report.summary
                  .totalAbsent,
              icon: "×",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "20px",
                boxShadow:
                  "0 8px 25px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  {card.label}
                </span>

                <span
                  style={{
                    fontSize: "20px",
                  }}
                >
                  {card.icon}
                </span>
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  marginTop: "10px",
                  letterSpacing: "-1px",
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* ==========================================
            OVERALL ATTENDANCE
            ========================================== */}

        <div
          style={{
            background: "#0f172a",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "30px",
            flexWrap: "wrap",
            boxShadow:
              "0 15px 40px rgba(15,23,42,0.15)",
          }}
        >
          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                textTransform:
                  "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "8px",
              }}
            >
              Overall Attendance
            </div>

            <div
              style={{
                fontSize: "42px",
                fontWeight: 800,
                letterSpacing: "-1.5px",
              }}
            >
              {percentage.toFixed(1)}%
            </div>

            <div
              style={{
                color: "#cbd5e1",
                marginTop: "4px",
                fontSize: "14px",
              }}
            >
              Across all recorded
              attendance sessions
            </div>
          </div>

          <div
            style={{
              width: "230px",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                color: "#cbd5e1",
                fontSize: "12px",
                marginBottom: "8px",
              }}
            >
              <span>Attendance</span>
              <span>
                {percentage.toFixed(1)}%
              </span>
            </div>

            <div
              style={{
                height: "10px",
                background:
                  "rgba(255,255,255,0.12)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background:
                    "#22c55e",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            STUDENT ATTENDANCE
            ========================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "15px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
              }}
            >
              Student Attendance
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              {filteredStudents.length} of{" "}
              {report.students.length}{" "}
              students shown
            </p>
          </div>
        </div>

        {/* ==========================================
            SEARCH + FILTERS
            ========================================== */}

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "16px",
            marginBottom: "15px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            boxShadow:
              "0 8px 25px rgba(15,23,42,0.04)",
          }}
        >
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search student, registration no or email..."
            style={{
              flex: "1 1 280px",
              minWidth: "220px",
              padding:
                "12px 14px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px",
              background: "#f8fafc",
            }}
          />

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target
                  .value as AttendanceFilter
              )
            }
            style={{
              padding:
                "12px 14px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "#f8fafc",
              cursor: "pointer",
              minWidth: "170px",
            }}
          >
            <option value="ALL">
              All Students
            </option>

            <option value="GOOD">
              Good ≥ 75%
            </option>

            <option value="WARNING">
              Warning 60-74%
            </option>

            <option value="LOW">
              Low &lt; 60%
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target
                  .value as SortOption
              )
            }
            style={{
              padding:
                "12px 14px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "#f8fafc",
              cursor: "pointer",
              minWidth: "190px",
            }}
          >
            <option value="NAME">
              Sort by Name
            </option>

            <option value="REGISTRATION">
              Sort by Registration
            </option>

            <option value="ATTENDANCE_HIGH">
              Highest Attendance
            </option>

            <option value="ATTENDANCE_LOW">
              Lowest Attendance
            </option>
          </select>
        </div>

        {/* ==========================================
            TABLE
            ========================================== */}

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          {filteredStudents.length ===
          0 ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  marginBottom: "12px",
                }}
              >
                🔎
              </div>

              <h3
                style={{
                  margin:
                    "0 0 8px",
                }}
              >
                No students found
              </h3>

              <p
                style={{
                  color: "#64748b",
                  margin: 0,
                }}
              >
                Try changing your
                search or filter.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth: "850px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f8fafc",
                    }}
                  >
                    {[
                      "#",
                      "Student",
                      "Registration",
                      "Semester",
                      "Present",
                      "Late",
                      "Absent",
                      "Attendance",
                    ].map(
                      (heading) => (
                        <th
                          key={heading}
                          style={{
                            padding:
                              "15px 16px",
                            textAlign:
                              heading ===
                                "Present" ||
                              heading ===
                                "Late" ||
                              heading ===
                                "Absent" ||
                              heading ===
                                "Attendance"
                                ? "center"
                                : "left",
                            fontSize:
                              "12px",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.05em",
                            color:
                              "#64748b",
                            borderBottom:
                              "1px solid #e2e8f0",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(
                    (
                      student,
                      index
                    ) => {
                      const attendance =
                        Math.min(
                          100,
                          Math.max(
                            0,
                            student.attendancePercentage
                          )
                        );

                      const status =
                        attendance >=
                        75
                          ? "GOOD"
                          : attendance >=
                            60
                          ? "WARNING"
                          : "LOW";

                      return (
                        <tr
                          key={
                            student.studentId
                          }
                          style={{
                            borderBottom:
                              "1px solid #f1f5f9",
                          }}
                        >
                          <td
                            style={{
                              padding:
                                "15px 16px",
                              color:
                                "#94a3b8",
                              fontSize:
                                "13px",
                            }}
                          >
                            {index + 1}
                          </td>

                          <td
                            style={{
                              padding:
                                "15px 16px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight:
                                  700,
                                color:
                                  "#0f172a",
                              }}
                            >
                              {
                                student.name
                              }
                            </div>

                            <div
                              style={{
                                color:
                                  "#94a3b8",
                                fontSize:
                                  "12px",
                                marginTop:
                                  "3px",
                              }}
                            >
                              {
                                student.email
                              }
                            </div>
                          </td>

                          <td
                            style={{
                              padding:
                                "15px 16px",
                              fontWeight:
                                600,
                              color:
                                "#475569",
                            }}
                          >
                            {
                              student.registrationNo
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                "15px 16px",
                              textAlign:
                                "center",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                minWidth:
                                  "32px",
                                height:
                                  "28px",
                                padding:
                                  "0 8px",
                                borderRadius:
                                  "8px",
                                background:
                                  "#f1f5f9",
                                color:
                                  "#475569",
                                fontSize:
                                  "13px",
                                fontWeight:
                                  700,
                              }}
                            >
                              {
                                student.semester
                              }
                            </span>
                          </td>

                          <td
                            style={{
                              padding:
                                "15px 16px",
                              textAlign:
                                "center",
                              fontWeight:
                                700,
                              color:
                                "#16a34a",
                            }}
                          >
                            {
                              student.present
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                "15px 16px",
                              textAlign:
                                "center",
                              fontWeight:
                                700,
                              color:
                                "#d97706",
                            }}
                          >
                            {
                              student.late
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                "15px 16px",
                              textAlign:
                                "center",
                              fontWeight:
                                700,
                              color:
                                "#dc2626",
                            }}
                          >
                            {
                              student.absent
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                "15px 16px",
                              textAlign:
                                "center",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap: "10px",
                              }}
                            >
                              <div
                                style={{
                                  width:
                                    "70px",
                                  height:
                                    "7px",
                                  background:
                                    "#e2e8f0",
                                  borderRadius:
                                    "999px",
                                  overflow:
                                    "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${attendance}%`,
                                    height:
                                      "100%",
                                    background:
                                      status ===
                                      "GOOD"
                                        ? "#22c55e"
                                        : status ===
                                          "WARNING"
                                        ? "#f59e0b"
                                        : "#ef4444",
                                    borderRadius:
                                      "999px",
                                  }}
                                />
                              </div>

                              <span
                                style={{
                                  minWidth:
                                    "48px",
                                  fontWeight:
                                    800,
                                  color:
                                    status ===
                                    "GOOD"
                                      ? "#16a34a"
                                      : status ===
                                        "WARNING"
                                      ? "#d97706"
                                      : "#dc2626",
                                }}
                              >
                                {attendance.toFixed(
                                  1
                                )}
                                %
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessorCourseAttendance;