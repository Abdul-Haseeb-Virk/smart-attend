import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      login(token, user);

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Unable to connect to the server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.20), transparent 35%), radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.12), transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%)",
        color: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}

      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "rgba(37, 99, 235, 0.08)",
          filter: "blur(10px)",
          top: "-180px",
          left: "-160px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "rgba(6, 182, 212, 0.07)",
          filter: "blur(10px)",
          bottom: "-150px",
          right: "-120px",
          pointerEvents: "none",
        }}
      />

      {/* Main container */}

      <div
        className="smart-attend-login-grid"
        style={{
          width: "100%",
          maxWidth: "1050px",
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.1fr) minmax(360px, 0.9fr)",
          borderRadius: "28px",
          overflow: "hidden",
          backgroundColor: "rgba(15, 23, 42, 0.72)",
          border:
            "1px solid rgba(148, 163, 184, 0.12)",
          boxShadow:
            "0 30px 100px rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ==========================================
            LEFT SIDE
            ========================================== */}

        <div
          style={{
            padding: "55px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, rgba(37, 99, 235, 0.16), rgba(6, 182, 212, 0.04))",
            borderRight:
              "1px solid rgba(148, 163, 184, 0.08)",
          }}
        >
          {/* Brand */}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                boxShadow:
                  "0 10px 30px rgba(37, 99, 235, 0.3)",
                fontSize: "21px",
                fontWeight: 800,
              }}
            >
              S
            </div>

            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  letterSpacing: "-0.3px",
                }}
              >
                SmartAttend
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  marginTop: "2px",
                }}
              >
                Attendance Management
              </div>
            </div>
          </div>

          {/* Heading */}

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(36px, 5vw, 58px)",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              maxWidth: "550px",
            }}
          >
            Attendance,
            <br />

            <span
              style={{
                background:
                  "linear-gradient(135deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              made smarter.
            </span>
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "16px",
              lineHeight: 1.7,
              maxWidth: "500px",
              marginTop: "22px",
              marginBottom: "35px",
            }}
          >
            A modern QR-based attendance platform
            designed to make classroom attendance
            faster, simpler, and more reliable.
          </p>

          {/* Features */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {[
              {
                icon: "⌗",
                title: "QR-Based Attendance",
                description:
                  "Quickly mark attendance using a live QR code.",
              },
              {
                icon: "✓",
                title: "Real-Time Records",
                description:
                  "Keep attendance information organized and accessible.",
              },
              {
                icon: "↗",
                title: "Attendance Reports",
                description:
                  "Review attendance and export useful reports.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    minWidth: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      "rgba(59, 130, 246, 0.12)",
                    border:
                      "1px solid rgba(96, 165, 250, 0.12)",
                    color: "#60a5fa",
                    fontSize: "18px",
                  }}
                >
                  {feature.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    {feature.title}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "3px",
                    }}
                  >
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            RIGHT SIDE LOGIN
            ========================================== */}

        <div
          style={{
            padding: "55px 45px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "390px",
            }}
          >
            {/* Login heading */}

            <div style={{ marginBottom: "30px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  backgroundColor:
                    "rgba(34, 197, 94, 0.08)",
                  border:
                    "1px solid rgba(34, 197, 94, 0.15)",
                  color: "#86efac",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                <span>●</span>
                SECURE LOGIN
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "30px",
                  letterSpacing: "-0.8px",
                }}
              >
                Welcome back
              </h2>

              <p
                style={{
                  marginTop: "8px",
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              >
                Sign in to continue to your
                SmartAttend dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Email */}

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                    marginBottom: "8px",
                  }}
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 15px",
                    borderRadius: "12px",
                    border:
                      "1px solid rgba(148, 163, 184, 0.16)",
                    outline: "none",
                    backgroundColor:
                      "rgba(2, 6, 23, 0.55)",
                    color: "#f8fafc",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(96, 165, 250, 0.65)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(37, 99, 235, 0.10)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(148, 163, 184, 0.16)";
                    e.currentTarget.style.boxShadow =
                      "none";
                  }}
                />
              </div>

              {/* Password */}

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#cbd5e1",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 15px",
                    borderRadius: "12px",
                    border:
                      "1px solid rgba(148, 163, 184, 0.16)",
                    outline: "none",
                    backgroundColor:
                      "rgba(2, 6, 23, 0.55)",
                    color: "#f8fafc",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(96, 165, 250, 0.65)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(37, 99, 235, 0.10)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(148, 163, 184, 0.16)";
                    e.currentTarget.style.boxShadow =
                      "none";
                  }}
                />
              </div>

              {/* Error */}

              {error && (
                <div
                  role="alert"
                  style={{
                    padding: "12px 14px",
                    marginBottom: "18px",
                    borderRadius: "12px",
                    backgroundColor:
                      "rgba(239, 68, 68, 0.08)",
                    border:
                      "1px solid rgba(248, 113, 113, 0.20)",
                    color: "#fca5a5",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Login button */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  borderRadius: "12px",
                  background:
                    loading
                      ? "rgba(37, 99, 235, 0.45)"
                      : "linear-gradient(135deg, #2563eb, #0891b2)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 10px 30px rgba(37, 99, 235, 0.25)",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform =
                      "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 35px rgba(37, 99, 235, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    loading
                      ? "none"
                      : "0 10px 30px rgba(37, 99, 235, 0.25)";
                }}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "9px",
                    }}
                  >
                    <span>●</span>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign in
                    <span
                      style={{
                        marginLeft: "8px",
                      }}
                    >
                      →
                    </span>
                  </>
                )}
              </button>

              {/* Register link */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "20px",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                <span>
                  Don't have an account?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                  style={{
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: "#60a5fa",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color =
                      "#22d3ee";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      "#60a5fa";
                  }}
                >
                  Create an account
                </button>
              </div>
            </form>

            {/* Footer */}

            <div
              style={{
                textAlign: "center",
                marginTop: "28px",
                paddingTop: "20px",
                borderTop:
                  "1px solid rgba(148, 163, 184, 0.08)",
                color: "#475569",
                fontSize: "12px",
              }}
            >
              SmartAttend
              <span style={{ margin: "0 7px" }}>
                •
              </span>
              QR-Based Attendance System
            </div>
          </div>
        </div>
      </div>

      {/* Responsive */}

      <style>
        {`
          @media (max-width: 800px) {
            .smart-attend-login-grid {
              grid-template-columns: 1fr !important;
            }

            .smart-attend-login-grid > div:first-child {
              padding: 40px 30px !important;
            }

            .smart-attend-login-grid > div:last-child {
              padding: 40px 30px !important;
            }
          }

          @media (max-width: 480px) {
            .smart-attend-login-grid {
              border-radius: 20px !important;
            }

            .smart-attend-login-grid > div:first-child {
              padding: 30px 22px !important;
            }

            .smart-attend-login-grid > div:last-child {
              padding: 30px 22px !important;
            }
          }
        `}
      </style>
    </div>
  );
}