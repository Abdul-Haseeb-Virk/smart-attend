import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 45%, #172554 100%)",
        color: "#f8fafc",
        padding: "30px 20px",
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
            marginBottom: "40px",
            flexWrap: "wrap",
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
                  "rgba(37, 99, 235, 0.15)",
                border:
                  "1px solid rgba(96, 165, 250, 0.25)",
                color: "#93c5fd",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  display: "inline-block",
                }}
              />

              Student Portal
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(30px, 5vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-1px",
              }}
            >
              Welcome back,
              <br />
              <span
                style={{
                  color: "#60a5fa",
                }}
              >
                {user?.name || "Student"}
              </span>
            </h1>

            <p
              style={{
                marginTop: "12px",
                marginBottom: 0,
                color: "#94a3b8",
                fontSize: "15px",
              }}
            >
              Manage your attendance and academic activity
              from one place.
            </p>
          </div>

          {/* PROFILE / LOGOUT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px 8px 8px",
                borderRadius: "14px",
                backgroundColor:
                  "rgba(255, 255, 255, 0.06)",
                border:
                  "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #2563eb, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "S"}
              </div>

              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {user?.name || "Student"}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  {user?.role || "STUDENT"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              style={{
                padding: "11px 16px",
                borderRadius: "12px",
                border:
                  "1px solid rgba(248, 113, 113, 0.25)",
                backgroundColor:
                  "rgba(239, 68, 68, 0.10)",
                color: "#fca5a5",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* ==========================================
            MAIN ACTION
            ========================================== */}

        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
            padding: "32px",
            marginBottom: "24px",
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.28), rgba(6, 182, 212, 0.12))",
            border:
              "1px solid rgba(96, 165, 250, 0.20)",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Decorative circle */}

          <div
            style={{
              position: "absolute",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              right: "-100px",
              top: "-120px",
              background:
                "rgba(59, 130, 246, 0.12)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "30px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                maxWidth: "650px",
              }}
            >
              <div
                style={{
                  fontSize: "38px",
                  marginBottom: "12px",
                }}
              >
                📷
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                }}
              >
                Mark your attendance
              </h2>

              <p
                style={{
                  color: "#bfdbfe",
                  lineHeight: 1.6,
                  marginTop: "10px",
                  marginBottom: "22px",
                }}
              >
                Scan the QR code displayed by your professor
                to quickly mark your attendance for the
                current class.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/scan")
                }
                style={{
                  padding: "13px 22px",
                  border: "none",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #2563eb, #0891b2)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow:
                    "0 8px 25px rgba(37, 99, 235, 0.30)",
                }}
              >
                Open QR Scanner
                <span
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  →
                </span>
              </button>
            </div>

            <div
              style={{
                minWidth: "180px",
                minHeight: "180px",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "rgba(15, 23, 42, 0.45)",
                border:
                  "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "80px",
              }}
            >
              ◫
            </div>
          </div>
        </section>

        {/* ==========================================
            QUICK ACTIONS
            ========================================== */}

        <section>
          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
              }}
            >
              Quick Actions
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Access your attendance tools
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {/* MY ATTENDANCE */}

            <button
              type="button"
              onClick={() =>
                navigate("/student/attendance")
              }
              style={{
                textAlign: "left",
                padding: "24px",
                borderRadius: "20px",
                border:
                  "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor:
                  "rgba(255, 255, 255, 0.045)",
                color: "#f8fafc",
                cursor: "pointer",
                transition:
                  "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                  "translateY(-4px)";
                event.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  "translateY(0)";
                event.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.045)";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    "rgba(59, 130, 246, 0.15)",
                  color: "#60a5fa",
                  fontSize: "24px",
                  marginBottom: "18px",
                }}
              >
                ✓
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                }}
              >
                My Attendance
              </h3>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.5,
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                View your attendance records and class
                history.
              </p>

              <span
                style={{
                  color: "#60a5fa",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                View attendance →
              </span>
            </button>

            {/* QR SCANNER */}

            <button
              type="button"
              onClick={() =>
                navigate("/student/scan")
              }
              style={{
                textAlign: "left",
                padding: "24px",
                borderRadius: "20px",
                border:
                  "1px solid rgba(34, 211, 238, 0.15)",
                background:
                  "linear-gradient(145deg, rgba(8, 145, 178, 0.10), rgba(255, 255, 255, 0.035))",
                color: "#f8fafc",
                cursor: "pointer",
                transition:
                  "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                  "translateY(-4px)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  "translateY(0)";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    "rgba(6, 182, 212, 0.14)",
                  color: "#22d3ee",
                  fontSize: "24px",
                  marginBottom: "18px",
                }}
              >
                ⌗
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                }}
              >
                Scan Attendance
              </h3>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.5,
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                Open your camera and scan your professor's
                live attendance QR code.
              </p>

              <span
                style={{
                  color: "#22d3ee",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                Start scanning →
              </span>
            </button>
          </div>
        </section>

        {/* ==========================================
            STUDENT INFORMATION
            ========================================== */}

        <section
          style={{
            marginTop: "24px",
            padding: "24px",
            borderRadius: "20px",
            backgroundColor:
              "rgba(255, 255, 255, 0.035)",
            border:
              "1px solid rgba(255, 255, 255, 0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Account Information
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Your current account details
              </p>
            </div>

            <span
              style={{
                padding: "6px 11px",
                borderRadius: "999px",
                backgroundColor:
                  "rgba(34, 197, 94, 0.10)",
                border:
                  "1px solid rgba(34, 197, 94, 0.18)",
                color: "#86efac",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              ● ACTIVE
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderRadius: "14px",
                backgroundColor:
                  "rgba(15, 23, 42, 0.45)",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  marginBottom: "6px",
                }}
              >
                NAME
              </div>

              <div
                style={{
                  fontWeight: 600,
                }}
              >
                {user?.name || "Not available"}
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "14px",
                backgroundColor:
                  "rgba(15, 23, 42, 0.45)",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  marginBottom: "6px",
                }}
              >
                ROLE
              </div>

              <div
                style={{
                  fontWeight: 600,
                }}
              >
                {user?.role || "STUDENT"}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            FOOTER
            ========================================== */}

        <footer
          style={{
            textAlign: "center",
            padding: "30px 0 10px",
            color: "#475569",
            fontSize: "12px",
          }}
        >
          Smart Attend
          <span style={{ margin: "0 7px" }}>•</span>
          Student Portal
        </footer>
      </div>
    </div>
  );
}

export default StudentDashboard;