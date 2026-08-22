import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

type CourseAttendance = {
  courseId: number;
  code: string;
  name: string;
  creditHours: number;

  professor: {
    id: number;
    employeeNo: string;
    name: string;
  };

  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  attended: number;
  attendancePercentage: number;
};

type AttendanceRecord = {
  id: number;
  status: string;
  markedAt: string;
  sessionId: number;

  course: {
    id: number;
    code: string;
    name: string;
  };
};

type StudentReport = {
  student: {
    id: number;
    registrationNo: string;
    name: string;
    email: string;

    department: {
      id: number;
      name: string;
      code: string;
    };

    semester: number;
  };

  summary: {
    totalSessions: number;
    present: number;
    late: number;
    absent: number;
    attended: number;
    attendancePercentage: number;
  };

  courses: CourseAttendance[];

  attendanceRecords: AttendanceRecord[];
};

function StudentAttendance() {
  const navigate = useNavigate();

  const [report, setReport] =
    useState<StudentReport | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const loadAttendance = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * Get the student's own profile first.
       */
      const response =
        await api.get("/students/me");

      const studentId =
        response.data.student.id;

      /*
       * Get the attendance report.
       */
      const attendanceResponse =
        await api.get(
          `/attendance/reports/student/${studentId}`
        );

      setReport(
        attendanceResponse.data
      );
    } catch (error: any) {
      console.error(
        "Load student attendance error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load attendance"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  /*
   * Filter attendance history.
   */
  const filteredRecords = useMemo(() => {
    if (!report) {
      return [];
    }

    return report.attendanceRecords.filter(
      (record) => {
        const matchesStatus =
          statusFilter === "ALL" ||
          record.status === statusFilter;

        const searchText =
          search.trim().toLowerCase();

        if (!searchText) {
          return matchesStatus;
        }

        const matchesSearch =
          record.course.code
            .toLowerCase()
            .includes(searchText) ||
          record.course.name
            .toLowerCase()
            .includes(searchText);

        return (
          matchesStatus &&
          matchesSearch
        );
      }
    );
  }, [
    report,
    search,
    statusFilter,
  ]);

  /*
   * Determine overall attendance state.
   */
  const attendancePercentage =
    report?.summary.attendancePercentage ?? 0;

  const attendanceLevel =
    attendancePercentage >= 85
      ? {
          label: "Excellent",
          description:
            "Your attendance is in a strong position.",
        }
      : attendancePercentage >= 75
      ? {
          label: "Good",
          description:
            "Your attendance is currently acceptable.",
        }
      : attendancePercentage >= 65
      ? {
          label: "Needs Attention",
          description:
            "Try to attend more classes to improve your percentage.",
        }
      : {
          label: "At Risk",
          description:
            "Your attendance is below the recommended level.",
        };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 50%, #172554 100%)",
          color: "#f8fafc",
          padding: "40px 20px",
          boxSizing: "border-box",
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
              padding: "30px",
              borderRadius: "24px",
              backgroundColor:
                "rgba(255, 255, 255, 0.045)",
              border:
                "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                width: "220px",
                height: "30px",
                borderRadius: "8px",
                backgroundColor:
                  "rgba(255, 255, 255, 0.08)",
                marginBottom: "15px",
              }}
            />

            <div
              style={{
                width: "320px",
                height: "16px",
                borderRadius: "8px",
                backgroundColor:
                  "rgba(255, 255, 255, 0.06)",
              }}
            />

            <p
              style={{
                color: "#94a3b8",
                marginTop: "25px",
              }}
            >
              Loading your attendance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 50%, #172554 100%)",
          color: "#f8fafc",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "100px auto",
            textAlign: "center",
            padding: "35px",
            borderRadius: "24px",
            backgroundColor:
              "rgba(239, 68, 68, 0.08)",
            border:
              "1px solid rgba(248, 113, 113, 0.20)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              backgroundColor:
                "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              fontSize: "28px",
            }}
          >
            !
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            Unable to load attendance
          </h1>

          <p
            style={{
              color: "#fca5a5",
              lineHeight: 1.6,
              margin: "15px 0 25px",
            }}
          >
            {error}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() =>
                loadAttendance()
              }
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #2563eb, #0891b2)",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/student")
              }
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(255, 255, 255, 0.10)",
                backgroundColor:
                  "rgba(255, 255, 255, 0.05)",
                color: "#f8fafc",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 50%, #172554 100%)",
        color: "#f8fafc",
        padding: "30px 20px 50px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* ==========================================
            HEADER
            ========================================== */}

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 12px",
                borderRadius: "999px",
                backgroundColor:
                  "rgba(37, 99, 235, 0.12)",
                border:
                  "1px solid rgba(96, 165, 250, 0.18)",
                color: "#93c5fd",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Attendance Overview
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(30px, 5vw, 42px)",
                letterSpacing: "-1px",
              }}
            >
              My Attendance
            </h1>

            <p
              style={{
                color: "#94a3b8",
                marginTop: "8px",
              }}
            >
              Track your attendance across all
              registered courses.
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
                loadAttendance(true)
              }
              disabled={refreshing}
              style={{
                padding: "11px 17px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(255, 255, 255, 0.10)",
                backgroundColor:
                  "rgba(255, 255, 255, 0.05)",
                color: "#f8fafc",
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

            <button
              type="button"
              onClick={() =>
                navigate("/student")
              }
              style={{
                padding: "11px 17px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #2563eb, #0891b2)",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ← Dashboard
            </button>
          </div>
        </header>

        {/* ==========================================
            STUDENT PROFILE
            ========================================== */}

        <section
          style={{
            padding: "24px",
            borderRadius: "22px",
            marginBottom: "24px",
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(6, 182, 212, 0.06))",
            border:
              "1px solid rgba(96, 165, 250, 0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "62px",
                height: "62px",
                flexShrink: 0,
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              {report.student.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: "220px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                }}
              >
                {report.student.name}
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#94a3b8",
                }}
              >
                {report.student.email}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <InfoPill
                label="Registration"
                value={
                  report.student
                    .registrationNo
                }
              />

              <InfoPill
                label="Semester"
                value={`Semester ${report.student.semester}`}
              />

              <InfoPill
                label="Department"
                value={
                  report.student
                    .department.code
                }
              />
            </div>
          </div>
        </section>

        {/* ==========================================
            OVERALL ATTENDANCE HERO
            ========================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(230px, 0.8fr) minmax(300px, 1.2fr)",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* PERCENTAGE */}

          <div
            style={{
              padding: "28px",
              borderRadius: "24px",
              background:
                "linear-gradient(145deg, rgba(37, 99, 235, 0.18), rgba(15, 23, 42, 0.5))",
              border:
                "1px solid rgba(96, 165, 250, 0.16)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "155px",
                height: "155px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `conic-gradient(
                  #3b82f6 ${Math.min(
                    attendancePercentage,
                    100
                  )}%,
                  rgba(255,255,255,0.07) 0
                )`,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "125px",
                  height: "125px",
                  borderRadius: "50%",
                  backgroundColor: "#111827",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <strong
                  style={{
                    fontSize: "30px",
                  }}
                >
                  {attendancePercentage.toFixed(
                    1
                  )}
                  %
                </strong>

                <span
                  style={{
                    color: "#64748b",
                    fontSize: "11px",
                    marginTop: "3px",
                  }}
                >
                  ATTENDANCE
                </span>
              </div>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "21px",
              }}
            >
              {attendanceLevel.label}
            </h2>

            <p
              style={{
                color: "#94a3b8",
                lineHeight: 1.5,
                fontSize: "13px",
                marginBottom: 0,
              }}
            >
              {attendanceLevel.description}
            </p>
          </div>

          {/* SUMMARY STATS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(130px, 1fr))",
              gap: "14px",
            }}
          >
            <StatCard
              label="Total Sessions"
              value={
                report.summary
                  .totalSessions
              }
              icon="◷"
            />

            <StatCard
              label="Present"
              value={
                report.summary.present
              }
              icon="✓"
              accent="#22c55e"
            />

            <StatCard
              label="Late"
              value={
                report.summary.late
              }
              icon="!"
              accent="#f59e0b"
            />

            <StatCard
              label="Absent"
              value={
                report.summary.absent
              }
              icon="×"
              accent="#ef4444"
            />
          </div>
        </section>

        {/* ==========================================
            COURSE ATTENDANCE
            ========================================== */}

        <section
          style={{
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "23px",
              }}
            >
              Attendance by Course
            </h2>

            <p
              style={{
                color: "#64748b",
                marginTop: "6px",
                fontSize: "14px",
              }}
            >
              See how you are performing in each
              course.
            </p>
          </div>

          {report.courses.length === 0 ? (
            <EmptyState
              title="No course attendance yet"
              message="Your course attendance information will appear here once classes are recorded."
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
              }}
            >
              {report.courses.map(
                (course) => {
                  const percentage =
                    course.attendancePercentage;

                  const progress =
                    Math.min(
                      Math.max(
                        percentage,
                        0
                      ),
                      100
                    );

                  const statusColor =
                    percentage >= 85
                      ? "#22c55e"
                      : percentage >= 75
                      ? "#3b82f6"
                      : percentage >=
                        65
                      ? "#f59e0b"
                      : "#ef4444";

                  return (
                    <div
                      key={
                        course.courseId
                      }
                      style={{
                        padding: "22px",
                        borderRadius:
                          "20px",
                        backgroundColor:
                          "rgba(255, 255, 255, 0.04)",
                        border:
                          "1px solid rgba(255, 255, 255, 0.08)",
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
                          gap: "12px",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "8px",
                              backgroundColor:
                                "rgba(59, 130, 246, 0.12)",
                              color:
                                "#93c5fd",
                              fontSize:
                                "12px",
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              course.code
                            }
                          </span>

                          <h3
                            style={{
                              margin:
                                "12px 0 5px",
                              fontSize:
                                "18px",
                            }}
                          >
                            {
                              course.name
                            }
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              color:
                                "#64748b",
                              fontSize:
                                "13px",
                            }}
                          >
                            {
                              course
                                .creditHours
                            }{" "}
                            credit hours
                          </p>
                        </div>

                        <strong
                          style={{
                            color:
                              statusColor,
                            fontSize:
                              "20px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {percentage.toFixed(
                            1
                          )}
                          %
                        </strong>
                      </div>

                      <div
                        style={{
                          marginTop:
                            "20px",
                          height: "8px",
                          borderRadius:
                            "999px",
                          backgroundColor:
                            "rgba(255,255,255,0.07)",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${progress}%`,
                            height:
                              "100%",
                            borderRadius:
                              "999px",
                            background:
                              `linear-gradient(90deg, ${statusColor}, #22d3ee)`,
                            transition:
                              "width 0.4s ease",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "repeat(3, 1fr)",
                          gap: "8px",
                          marginTop:
                            "18px",
                        }}
                      >
                        <MiniStat
                          label="Present"
                          value={
                            course.present
                          }
                          color="#86efac"
                        />

                        <MiniStat
                          label="Late"
                          value={
                            course.late
                          }
                          color="#fcd34d"
                        />

                        <MiniStat
                          label="Absent"
                          value={
                            course.absent
                          }
                          color="#fca5a5"
                        />
                      </div>

                      <div
                        style={{
                          marginTop:
                            "18px",
                          paddingTop:
                            "15px",
                          borderTop:
                            "1px solid rgba(255,255,255,0.07)",
                          color:
                            "#64748b",
                          fontSize:
                            "12px",
                        }}
                      >
                        Professor:{" "}
                        <span
                          style={{
                            color:
                              "#cbd5e1",
                          }}
                        >
                          {
                            course
                              .professor
                              .name
                          }
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* ==========================================
            ATTENDANCE HISTORY
            ========================================== */}

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "23px",
                }}
              >
                Attendance History
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginTop: "6px",
                  fontSize: "14px",
                }}
              >
                Your recently recorded attendance
                sessions.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Search course..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                style={{
                  width: "190px",
                  padding:
                    "10px 13px",
                  borderRadius:
                    "11px",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  backgroundColor:
                    "rgba(255,255,255,0.05)",
                  color: "#f8fafc",
                  outline: "none",
                  boxSizing:
                    "border-box",
                }}
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                style={{
                  padding:
                    "10px 13px",
                  borderRadius:
                    "11px",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  backgroundColor:
                    "#111827",
                  color: "#f8fafc",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">
                  All Status
                </option>
                <option value="PRESENT">
                  Present
                </option>
                <option value="LATE">
                  Late
                </option>
                <option value="ABSENT">
                  Absent
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              border:
                "1px solid rgba(255,255,255,0.08)",
              backgroundColor:
                "rgba(255,255,255,0.03)",
            }}
          >
            {filteredRecords.length ===
            0 ? (
              <EmptyState
                title="No attendance records found"
                message={
                  search ||
                  statusFilter !== "ALL"
                    ? "Try changing your search or status filter."
                    : "Your attendance history will appear here after attendance is recorded."
                }
              />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: "650px",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "rgba(255,255,255,0.035)",
                      }}
                    >
                      <th
                        style={tableHeaderStyle}
                      >
                        Course
                      </th>

                      <th
                        style={tableHeaderStyle}
                      >
                        Status
                      </th>

                      <th
                        style={tableHeaderStyle}
                      >
                        Date
                      </th>

                      <th
                        style={tableHeaderStyle}
                      >
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map(
                      (record) => {
                        const date =
                          new Date(
                            record.markedAt
                          );

                        return (
                          <tr
                            key={
                              record.id
                            }
                            style={{
                              borderTop:
                                "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <td
                              style={
                                tableCellStyle
                              }
                            >
                              <div
                                style={{
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  record
                                    .course
                                    .code
                                }
                              </div>

                              <div
                                style={{
                                  color:
                                    "#64748b",
                                  fontSize:
                                    "12px",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                {
                                  record
                                    .course
                                    .name
                                }
                              </div>
                            </td>

                            <td
                              style={
                                tableCellStyle
                              }
                            >
                              <StatusBadge
                                status={
                                  record.status
                                }
                              />
                            </td>

                            <td
                              style={
                                tableCellStyle
                              }
                            >
                              {date.toLocaleDateString()}
                            </td>

                            <td
                              style={
                                tableCellStyle
                              }
                            >
                              <span
                                style={{
                                  color:
                                    "#94a3b8",
                                }}
                              >
                                {date.toLocaleTimeString(
                                  [],
                                  {
                                    hour:
                                      "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </span>
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
        </section>

        {/* ==========================================
            FOOTER
            ========================================== */}

        <footer
          style={{
            textAlign: "center",
            padding: "30px 0 0",
            color: "#475569",
            fontSize: "12px",
          }}
        >
          Smart Attend
          <span
            style={{
              margin: "0 7px",
            }}
          >
            •
          </span>
          Attendance Portal
        </footer>
      </div>
    </div>
  );
}

/* ==========================================
   SMALL COMPONENTS
   ========================================== */

function InfoPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "9px 12px",
        borderRadius: "11px",
        backgroundColor:
          "rgba(15, 23, 42, 0.45)",
        border:
          "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "10px",
          fontWeight: 700,
          marginBottom: "3px",
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          color: "#cbd5e1",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent = "#60a5fa",
}: {
  label: string;
  value: number;
  icon: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        padding: "22px",
        borderRadius: "20px",
        backgroundColor:
          "rgba(255,255,255,0.04)",
        border:
          "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {label}
        </span>

        <span
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              `${accent}18`,
            color: accent,
            fontWeight: 800,
          }}
        >
          {icon}
        </span>
      </div>

      <strong
        style={{
          fontSize: "30px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "9px 5px",
        borderRadius: "10px",
        backgroundColor:
          "rgba(15,23,42,0.45)",
      }}
    >
      <div
        style={{
          color,
          fontWeight: 700,
          fontSize: "16px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: "10px",
          marginTop: "2px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toUpperCase();

  let color = "#94a3b8";
  let background =
    "rgba(148,163,184,0.10)";

  if (normalized === "PRESENT") {
    color = "#86efac";
    background =
      "rgba(34,197,94,0.10)";
  } else if (normalized === "LATE") {
    color = "#fcd34d";
    background =
      "rgba(245,158,11,0.10)";
  } else if (normalized === "ABSENT") {
    color = "#fca5a5";
    background =
      "rgba(239,68,68,0.10)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: "999px",
        backgroundColor: background,
        color,
        fontSize: "11px",
        fontWeight: 800,
      }}
    >
      {normalized}
    </span>
  );
}

function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      style={{
        padding: "40px 25px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          margin: "0 auto 15px",
          borderRadius: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            "rgba(59,130,246,0.10)",
          color: "#60a5fa",
          fontSize: "22px",
        }}
      >
        ◷
      </div>

      <h3
        style={{
          margin: 0,
          fontSize: "17px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          maxWidth: "500px",
          margin:
            "8px auto 0",
          color: "#64748b",
          lineHeight: 1.5,
          fontSize: "13px",
        }}
      >
        {message}
      </p>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: "15px 18px",
  textAlign: "left",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle: React.CSSProperties = {
  padding: "16px 18px",
  color: "#cbd5e1",
  fontSize: "13px",
};

export default StudentAttendance;