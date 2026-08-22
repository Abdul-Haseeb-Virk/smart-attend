import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

type StudentAttendance = {
  studentId: number;
  registrationNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  status: "PRESENT" | "LATE" | "ABSENT";
  markedAt: string | null;
};

type AttendanceReport = {
  session: {
    id: number;
    startedAt: string;
    expiresAt: string;
    isActive: boolean;
  };

  course: {
    id: number;
    code: string;
    name: string;
    creditHours: number;
  };

  professor: {
    id: number;
    employeeNo: string;
    name: string;
  };

  summary: {
    totalStudents: number;
    present: number;
    late: number;
    absent: number;
    attendancePercentage: number;
  };

  students: StudentAttendance[];
};

type FilterStatus =
  | "ALL"
  | "PRESENT"
  | "LATE"
  | "ABSENT";

function ProfessorAttendanceReport() {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionId =
    location.state?.sessionId;

  const courseId =
    location.state?.courseId;

  const [report, setReport] =
    useState<AttendanceReport | null>(null);

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

  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("ALL");

  /*
   * ==========================================
   * LOAD REPORT
   * ==========================================
   */

  const loadReport = async (
    showFullLoading = false
  ) => {
    if (!sessionId) {
      setError(
        "No attendance session was selected."
      );

      setLoading(false);

      return;
    }

    try {
      if (showFullLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response =
        await api.get(
          `/attendance/reports/session/${sessionId}`
        );

      setReport(response.data);
    } catch (error: any) {
      console.error(
        "Load attendance report error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load attendance report"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadReport(true);
  }, [sessionId]);

  /*
   * ==========================================
   * DOWNLOAD CSV
   * ==========================================
   */

  const downloadCSV = async () => {
    if (!courseId) {
      alert(
        "Course information is not available."
      );

      return;
    }

    try {
      setDownloading(true);

      const response =
        await api.get(
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
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${report?.course.code || "course"}_attendance.csv`;

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
      setDownloading(false);
    }
  };

  /*
   * ==========================================
   * FILTER STUDENTS
   * ==========================================
   */

  const filteredStudents =
    useMemo(() => {
      if (!report) {
        return [];
      }

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return report.students.filter(
        (student) => {
          const matchesSearch =
            !normalizedSearch ||
            student.name
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            student.registrationNo
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            student.email
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesStatus =
            statusFilter === "ALL" ||
            student.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      report,
      search,
      statusFilter,
    ]);

  /*
   * ==========================================
   * STATUS CONFIG
   * ==========================================
   */

  const getStatusStyle = (
    status: StudentAttendance["status"]
  ) => {
    if (status === "PRESENT") {
      return {
        background:
          "rgba(34,197,94,0.10)",
        border:
          "1px solid rgba(34,197,94,0.20)",
        color: "#86efac",
      };
    }

    if (status === "LATE") {
      return {
        background:
          "rgba(245,158,11,0.10)",
        border:
          "1px solid rgba(245,158,11,0.20)",
        color: "#fcd34d",
      };
    }

    return {
      background:
        "rgba(239,68,68,0.10)",
      border:
        "1px solid rgba(239,68,68,0.20)",
      color: "#fca5a5",
    };
  };

  const getStatusIcon = (
    status: StudentAttendance["status"]
  ) => {
    if (status === "PRESENT") {
      return "✓";
    }

    if (status === "LATE") {
      return "◷";
    }

    return "×";
  };

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 10% 5%, rgba(37,99,235,0.18), transparent 35%), #06101e",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              margin: "0 auto 18px",
              borderRadius: "50%",
              border:
                "4px solid rgba(255,255,255,0.10)",
              borderTopColor:
                "#22d3ee",
              animation:
                "attendanceReportSpin 1s linear infinite",
            }}
          />

          <h2
            style={{
              margin: "0 0 8px",
            }}
          >
            Loading Attendance
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Preparing the attendance report...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 10% 5%, rgba(239,68,68,0.12), transparent 35%), #06101e",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            padding: "35px 30px",
            textAlign: "center",
            borderRadius: "24px",
            background:
              "rgba(255,255,255,0.055)",
            border:
              "1px solid rgba(255,255,255,0.10)",
            backdropFilter:
              "blur(18px)",
            boxShadow:
              "0 30px 90px rgba(0,0,0,0.30)",
          }}
        >
          <div
            style={{
              width: "65px",
              height: "65px",
              margin: "0 auto 18px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(239,68,68,0.10)",
              border:
                "1px solid rgba(239,68,68,0.20)",
              color: "#f87171",
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            !
          </div>

          <h1
            style={{
              margin:
                "0 0 10px",
              fontSize: "26px",
            }}
          >
            Attendance Report
          </h1>

          <p
            style={{
              margin:
                "0 auto 25px",
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/professor")
            }
            style={{
              padding:
                "12px 22px",
              border: "none",
              borderRadius: "11px",
              background:
                "linear-gradient(135deg, #2563eb, #06b6d4)",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
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

  /*
   * ==========================================
   * MAIN UI
   * ==========================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "30px 20px 60px",
        background:
          "radial-gradient(circle at 8% 5%, rgba(37,99,235,0.18), transparent 34%), radial-gradient(circle at 92% 90%, rgba(6,182,212,0.11), transparent 34%), #06101e",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* ======================================
            HEADER
            ====================================== */}

        <div
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
                alignItems: "center",
                gap: "8px",
                padding:
                  "8px 13px",
                marginBottom:
                  "14px",
                borderRadius:
                  "999px",
                background:
                  "rgba(37,99,235,0.10)",
                border:
                  "1px solid rgba(96,165,250,0.18)",
                color: "#93c5fd",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing:
                  "1.2px",
                textTransform:
                  "uppercase",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius:
                    "50%",
                  background:
                    "#22d3ee",
                  boxShadow:
                    "0 0 12px rgba(34,211,238,0.7)",
                }}
              />

              Attendance Analytics
            </div>

            <h1
              style={{
                margin:
                  "0 0 8px",
                fontSize: "34px",
                fontWeight: 800,
                letterSpacing:
                  "-0.8px",
              }}
            >
              Attendance Report
            </h1>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              {report.course.code}
              {"  "}•{"  "}
              {report.course.name}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() =>
                loadReport()
              }
              disabled={refreshing}
              style={{
                padding:
                  "11px 17px",
                border:
                  "1px solid rgba(255,255,255,0.10)",
                borderRadius: "10px",
                background:
                  "rgba(255,255,255,0.04)",
                color: "#cbd5e1",
                cursor:
                  refreshing
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  refreshing
                    ? 0.6
                    : 1,
                fontWeight: 600,
              }}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={
                downloadCSV
              }
              disabled={
                downloading
              }
              style={{
                padding:
                  "11px 17px",
                border: "none",
                borderRadius: "10px",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                color: "#ffffff",
                cursor:
                  downloading
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  downloading
                    ? 0.6
                    : 1,
                fontWeight: 700,
                boxShadow:
                  "0 10px 25px rgba(37,99,235,0.20)",
              }}
            >
              {downloading
                ? "Preparing..."
                : "↓ Download CSV"}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/professor"
                )
              }
              style={{
                padding:
                  "11px 17px",
                border:
                  "1px solid rgba(255,255,255,0.10)",
                borderRadius: "10px",
                background:
                  "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* ======================================
            COURSE / SESSION INFO
            ====================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderRadius: "16px",
              background:
                "rgba(255,255,255,0.045)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 800,
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1px",
                marginBottom: "7px",
              }}
            >
              Course
            </div>

            <div
              style={{
                fontSize: "17px",
                fontWeight: 750,
              }}
            >
              {report.course.code}
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              {report.course.name}
            </div>
          </div>

          <div
            style={{
              padding: "18px",
              borderRadius: "16px",
              background:
                "rgba(255,255,255,0.045)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 800,
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1px",
                marginBottom: "7px",
              }}
            >
              Professor
            </div>

            <div
              style={{
                fontSize: "17px",
                fontWeight: 750,
              }}
            >
              {report.professor.name}
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Employee No:{" "}
              {report.professor.employeeNo}
            </div>
          </div>

          <div
            style={{
              padding: "18px",
              borderRadius: "16px",
              background:
                "rgba(255,255,255,0.045)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 800,
                textTransform:
                  "uppercase",
                letterSpacing:
                  "1px",
                marginBottom: "7px",
              }}
            >
              Session Status
            </div>

            <div
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "8px",
                padding:
                  "7px 11px",
                borderRadius:
                  "999px",
                background:
                  report.session
                    .isActive
                    ? "rgba(34,197,94,0.10)"
                    : "rgba(100,116,139,0.10)",
                border:
                  report.session
                    .isActive
                    ? "1px solid rgba(34,197,94,0.20)"
                    : "1px solid rgba(100,116,139,0.20)",
                color:
                  report.session
                    .isActive
                    ? "#86efac"
                    : "#94a3b8",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius:
                    "50%",
                  background:
                    report.session
                      .isActive
                      ? "#22c55e"
                      : "#64748b",
                }}
              />

              {report.session
                .isActive
                ? "Active"
                : "Inactive"}
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Started{" "}
              {new Date(
                report.session
                  .startedAt
              ).toLocaleString()}
            </div>
          </div>
        </div>

        {/* ======================================
            SUMMARY CARDS
            ====================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          {/* TOTAL */}

          <div
            style={{
              padding: "20px",
              borderRadius: "18px",
              background:
                "rgba(255,255,255,0.045)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Total Students
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "32px",
                fontWeight: 800,
              }}
            >
              {report.summary
                .totalStudents}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Enrolled students
            </div>
          </div>

          {/* PRESENT */}

          <div
            style={{
              padding: "20px",
              borderRadius: "18px",
              background:
                "rgba(34,197,94,0.055)",
              border:
                "1px solid rgba(34,197,94,0.15)",
            }}
          >
            <div
              style={{
                color: "#86efac",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Present
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "32px",
                fontWeight: 800,
                color: "#4ade80",
              }}
            >
              {report.summary.present}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Successfully attended
            </div>
          </div>

          {/* LATE */}

          <div
            style={{
              padding: "20px",
              borderRadius: "18px",
              background:
                "rgba(245,158,11,0.055)",
              border:
                "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <div
              style={{
                color: "#fcd34d",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Late
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "32px",
                fontWeight: 800,
                color: "#fbbf24",
              }}
            >
              {report.summary.late}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Late attendance
            </div>
          </div>

          {/* ABSENT */}

          <div
            style={{
              padding: "20px",
              borderRadius: "18px",
              background:
                "rgba(239,68,68,0.055)",
              border:
                "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <div
              style={{
                color: "#fca5a5",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Absent
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "32px",
                fontWeight: 800,
                color: "#f87171",
              }}
            >
              {report.summary.absent}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Did not attend
            </div>
          </div>

          {/* PERCENTAGE */}

          <div
            style={{
              padding: "20px",
              borderRadius: "18px",
              background:
                "rgba(6,182,212,0.055)",
              border:
                "1px solid rgba(6,182,212,0.15)",
            }}
          >
            <div
              style={{
                color: "#67e8f9",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Attendance Rate
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "32px",
                fontWeight: 800,
                color: "#22d3ee",
              }}
            >
              {Number(
                report.summary
                  .attendancePercentage
              ).toFixed(1)}
              %
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Overall attendance
            </div>
          </div>
        </div>

        {/* ======================================
            ATTENDANCE BAR
            ====================================== */}

        <div
          style={{
            padding: "20px",
            marginBottom: "25px",
            borderRadius: "18px",
            background:
              "rgba(255,255,255,0.045)",
            border:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Class Attendance
            </span>

            <span
              style={{
                color: "#67e8f9",
                fontSize: "13px",
                fontWeight: 800,
              }}
            >
              {Number(
                report.summary
                  .attendancePercentage
              ).toFixed(1)}
              %
            </span>
          </div>

          <div
            style={{
              height: "10px",
              overflow: "hidden",
              borderRadius: "999px",
              background:
                "rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    report.summary
                      .attendancePercentage
                  )
                )}%`,
                height: "100%",
                borderRadius:
                  "999px",
                background:
                  "linear-gradient(90deg, #2563eb, #06b6d4, #22c55e)",
                transition:
                  "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* ======================================
            SESSION INFORMATION
            ====================================== */}

        <div
          style={{
            padding: "20px",
            marginBottom: "25px",
            borderRadius: "18px",
            background:
              "rgba(255,255,255,0.045)",
            border:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
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
                  margin:
                    "0 0 5px",
                  fontSize: "18px",
                }}
              >
                Session Information
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Details about this
                attendance session
              </p>
            </div>

            <div
              style={{
                padding:
                  "7px 11px",
                borderRadius:
                  "999px",
                background:
                  report.session
                    .isActive
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(100,116,139,0.08)",
                color:
                  report.session
                    .isActive
                    ? "#86efac"
                    : "#94a3b8",
                border:
                  report.session
                    .isActive
                    ? "1px solid rgba(34,197,94,0.18)"
                    : "1px solid rgba(100,116,139,0.18)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {report.session
                .isActive
                ? "● Active"
                : "● Inactive"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background:
                  "rgba(255,255,255,0.025)",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  marginBottom:
                    "5px",
                }}
              >
                Started
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#cbd5e1",
                }}
              >
                {new Date(
                  report.session
                    .startedAt
                ).toLocaleString()}
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background:
                  "rgba(255,255,255,0.025)",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  marginBottom:
                    "5px",
                }}
              >
                Expires
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#cbd5e1",
                }}
              >
                {new Date(
                  report.session
                    .expiresAt
                ).toLocaleString()}
              </div>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background:
                  "rgba(255,255,255,0.025)",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  marginBottom:
                    "5px",
                }}
              >
                Session ID
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#cbd5e1",
                  fontFamily:
                    "monospace",
                }}
              >
                #{report.session.id}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            STUDENT TABLE HEADER
            ====================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "15px",
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 5px",
                fontSize: "20px",
              }}
            >
              Student Attendance
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Showing{" "}
              {filteredStudents.length}{" "}
              of{" "}
              {report.students.length}{" "}
              students
            </p>
          </div>
        </div>

        {/* ======================================
            FILTER BAR
            ====================================== */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              flex: "1 1 260px",
              position: "relative",
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name, registration no or email..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding:
                  "12px 14px",
                borderRadius:
                  "11px",
                border:
                  "1px solid rgba(255,255,255,0.10)",
                background:
                  "rgba(255,255,255,0.045)",
                color: "#ffffff",
                outline: "none",
                fontSize: "13px",
              }}
            />
          </div>

          {(
            [
              "ALL",
              "PRESENT",
              "LATE",
              "ABSENT",
            ] as FilterStatus[]
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(
                  status
                )
              }
              style={{
                padding:
                  "11px 14px",
                borderRadius:
                  "10px",
                border:
                  statusFilter ===
                  status
                    ? "1px solid rgba(34,211,238,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                background:
                  statusFilter ===
                  status
                    ? "rgba(6,182,212,0.12)"
                    : "rgba(255,255,255,0.035)",
                color:
                  statusFilter ===
                  status
                    ? "#67e8f9"
                    : "#94a3b8",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {status === "ALL"
                ? "All"
                : status}
            </button>
          ))}
        </div>

        {/* ======================================
            STUDENTS TABLE
            ====================================== */}

        <div
          style={{
            overflowX: "auto",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            background:
              "rgba(255,255,255,0.035)",
          }}
        >
          {filteredStudents.length ===
          0 ? (
            <div
              style={{
                padding: "55px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "35px",
                  marginBottom:
                    "12px",
                }}
              >
                ◌
              </div>

              <h3
                style={{
                  margin:
                    "0 0 7px",
                }}
              >
                No students found
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Try changing your
                search or status filter.
              </p>
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                minWidth: "850px",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  {[
                    "#",
                    "Student",
                    "Registration",
                    "Department",
                    "Semester",
                    "Status",
                    "Marked At",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding:
                          "14px 15px",
                        textAlign:
                          "left",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.7px",
                        borderBottom:
                          "1px solid rgba(255,255,255,0.07)",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(
                  (
                    student,
                    index
                  ) => (
                    <tr
                      key={
                        student.studentId
                      }
                    >
                      <td
                        style={{
                          padding:
                            "15px",
                          color:
                            "#64748b",
                          fontSize:
                            "12px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "11px",
                          }}
                        >
                          <div
                            style={{
                              width:
                                "36px",
                              height:
                                "36px",
                              flexShrink: 0,
                              borderRadius:
                                "11px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(6,182,212,0.18))",
                              color:
                                "#67e8f9",
                              fontWeight:
                                800,
                              fontSize:
                                "13px",
                            }}
                          >
                            {student.name
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <div
                              style={{
                                color:
                                  "#f8fafc",
                                fontWeight:
                                  700,
                                fontSize:
                                  "13px",
                              }}
                            >
                              {student.name}
                            </div>

                            <div
                              style={{
                                marginTop:
                                  "3px",
                                color:
                                  "#64748b",
                                fontSize:
                                  "11px",
                              }}
                            >
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        style={{
                          padding:
                            "15px",
                          color:
                            "#cbd5e1",
                          fontSize:
                            "12px",
                          fontFamily:
                            "monospace",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {student.registrationNo}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px",
                          color:
                            "#94a3b8",
                          fontSize:
                            "12px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {student.department}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px",
                          color:
                            "#94a3b8",
                          fontSize:
                            "12px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        Semester{" "}
                        {student.semester}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "6px",
                            padding:
                              "6px 9px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "11px",
                            fontWeight:
                              800,
                            ...getStatusStyle(
                              student.status
                            ),
                          }}
                        >
                          <span>
                            {getStatusIcon(
                              student.status
                            )}
                          </span>

                          {
                            student.status
                          }
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "15px",
                          color:
                            student.markedAt
                              ? "#cbd5e1"
                              : "#64748b",
                          fontSize:
                            "12px",
                          whiteSpace:
                            "nowrap",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {student.markedAt
                          ? new Date(
                              student.markedAt
                            ).toLocaleString()
                          : "Not marked"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ======================================
            FOOTER ACTIONS
            ====================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px",
            paddingTop: "18px",
            borderTop:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            Session started{" "}
            {new Date(
              report.session.startedAt
            ).toLocaleTimeString()}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/professor"
              )
            }
            style={{
              padding:
                "11px 18px",
              border:
                "1px solid rgba(255,255,255,0.10)",
              borderRadius: "10px",
              background:
                "rgba(255,255,255,0.035)",
              color: "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes attendanceReportSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          input::placeholder {
            color: #64748b;
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

export default ProfessorAttendanceReport;