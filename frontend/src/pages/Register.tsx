import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

type Department = {
  id: number;
  name: string;
  code: string;
};

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /*
   * ==========================================
   * LOAD DEPARTMENTS
   * ==========================================
   */

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
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
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  /*
   * ==========================================
   * PASSWORD STRENGTH
   * ==========================================
   */

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        label: "",
        width: "0%",
        className: "",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: "Weak",
        width: "25%",
        className: "weak",
      };
    }

    if (score <= 3) {
      return {
        label: "Medium",
        width: "60%",
        className: "medium",
      };
    }

    return {
      label: "Strong",
      width: "100%",
      className: "strong",
    };
  }, [password]);

  /*
   * ==========================================
   * PASSWORD MATCH
   * ==========================================
   */

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  /*
   * ==========================================
   * REGISTER
   * ==========================================
   */

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!registrationNo.trim()) {
      setError("Please enter your registration number.");
      return;
    }

    if (!departmentId) {
      setError("Please select your department.");
      return;
    }

    if (!semester) {
      setError("Please select your semester.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      /*
       * This is a STUDENT registration.
       */
      const response = await api.post(
        "/auth/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
          role: "STUDENT",
          registrationNo: registrationNo.trim(),
          departmentId: Number(departmentId),
          semester: Number(semester),
        }
      );

      setSuccess(
        response.data.message ||
          "Account created successfully."
      );

      /*
       * Clear sensitive fields.
       */
      setPassword("");
      setConfirmPassword("");

      /*
       * Give the user a moment to see
       * the success message.
       */
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.15fr 0.85fr",
        background: "#08101f",
        color: "#f8fafc",
      }}
    >
      {/* ==========================================
          LEFT BRANDING PANEL
          ========================================== */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "50px 8%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #10234a 0%, #0b1b39 55%, #081326 100%)",
          borderRight: "1px solid rgba(148,163,184,0.12)",
        }}
      >
        {/* Decorative glow */}

        <div
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%)",
            top: "-140px",
            left: "-120px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.14), transparent 70%)",
            bottom: "-180px",
            right: "-150px",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #2563eb, #06b6d4)",
              fontSize: "32px",
              fontWeight: 900,
              boxShadow:
                "0 15px 40px rgba(37,99,235,0.3)",
            }}
          >
            S
          </div>

          <div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              SmartAttend
            </div>

            <div
              style={{
                marginTop: "3px",
                color: "#7183a0",
                fontSize: "14px",
              }}
            >
              Attendance Management
            </div>
          </div>
        </div>

        {/* Hero */}

        <div
          style={{
            marginTop: "70px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "clamp(42px, 5vw, 72px)",
              lineHeight: 1.03,
              fontWeight: 850,
              letterSpacing: "-3px",
            }}
          >
            Join SmartAttend.
            <br />

            <span
              style={{
                background:
                  "linear-gradient(90deg, #60a5fa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Stay connected.
            </span>
          </div>

          <p
            style={{
              marginTop: "28px",
              maxWidth: "620px",
              color: "#91a4c1",
              fontSize: "18px",
              lineHeight: 1.7,
            }}
          >
            Create your student account and make
            classroom attendance faster, simpler,
            and more reliable.
          </p>
        </div>

        {/* Features */}

        <div
          style={{
            display: "grid",
            gap: "18px",
            marginTop: "48px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {[
            {
              icon: "⌁",
              title: "Quick QR Attendance",
              text: "Scan your professor's live QR code.",
            },
            {
              icon: "✓",
              title: "Real-Time Records",
              text: "Keep your attendance information organized.",
            },
            {
              icon: "↗",
              title: "Easy Access",
              text: "View your attendance whenever you need it.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  flexShrink: 0,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(37,99,235,0.16)",
                  border:
                    "1px solid rgba(96,165,250,0.15)",
                  color: "#60a5fa",
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                {feature.icon}
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 750,
                    fontSize: "16px",
                  }}
                >
                  {feature.title}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    color: "#7183a0",
                    fontSize: "14px",
                  }}
                >
                  {feature.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          RIGHT REGISTER PANEL
          ========================================== */}

      <div
        style={{
          minHeight: "100vh",
          padding: "45px 7%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1426",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "540px",
            padding: "15px 0",
          }}
        >
          {/* Badge */}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              padding: "9px 15px",
              borderRadius: "999px",
              background:
                "rgba(16,185,129,0.08)",
              border:
                "1px solid rgba(16,185,129,0.22)",
              color: "#6ee7b7",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#6ee7b7",
                boxShadow:
                  "0 0 10px rgba(110,231,183,0.7)",
              }}
            />

            STUDENT REGISTRATION
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(34px, 4vw, 48px)",
              lineHeight: 1.1,
              letterSpacing: "-1.8px",
            }}
          >
            Create your
            <br />
            <span
              style={{
                color: "#38bdf8",
              }}
            >
              SmartAttend account.
            </span>
          </h1>

          <p
            style={{
              marginTop: "14px",
              marginBottom: "30px",
              color: "#7183a0",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Enter your student information to get
            started with SmartAttend.
          </p>

          {/* FORM CARD */}

          <div
            style={{
              padding: "28px",
              borderRadius: "22px",
              background:
                "rgba(15,27,48,0.72)",
              border:
                "1px solid rgba(148,163,184,0.12)",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.25)",
            }}
          >
            <form onSubmit={handleRegister}>
              {/* NAME + EMAIL */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "15px",
                }}
              >
                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* REGISTRATION NUMBER */}

              <div className="form-group">
                <label>Registration Number</label>

                <input
                  type="text"
                  value={registrationNo}
                  onChange={(e) =>
                    setRegistrationNo(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 2023-BBA-001"
                  required
                  disabled={loading}
                />
              </div>

              {/* DEPARTMENT + SEMESTER */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.5fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="form-group">
                  <label>Department</label>

                  <select
                    value={departmentId}
                    onChange={(e) =>
                      setDepartmentId(
                        e.target.value
                      )
                    }
                    disabled={
                      loading ||
                      loadingDepartments
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "14px 15px",
                      border:
                        "1px solid #24324a",
                      borderRadius: "11px",
                      background: "#080f1e",
                      color: "#e2e8f0",
                      outline: "none",
                    }}
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading..."
                        : "Select department"}
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={
                            department.id
                          }
                        >
                          {department.name} (
                          {department.code})
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester</label>

                  <select
                    value={semester}
                    onChange={(e) =>
                      setSemester(
                        e.target.value
                      )
                    }
                    disabled={loading}
                    required
                    style={{
                      width: "100%",
                      padding: "14px 15px",
                      border:
                        "1px solid #24324a",
                      borderRadius: "11px",
                      background: "#080f1e",
                      color: "#e2e8f0",
                      outline: "none",
                    }}
                  >
                    <option value="">
                      Select semester
                    </option>

                    {Array.from(
                      { length: 8 },
                      (_, index) => (
                        <option
                          key={index + 1}
                          value={index + 1}
                        >
                          Semester{" "}
                          {index + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <label>Password</label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Create a password"
                    required
                    minLength={6}
                    disabled={loading}
                    style={{
                      paddingRight: "80px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: "auto",
                      padding: "6px 9px",
                      border: "none",
                      background:
                        "transparent",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {showPassword
                      ? "HIDE"
                      : "SHOW"}
                  </button>
                </div>

                {password && (
                  <div
                    style={{
                      marginTop: "9px",
                    }}
                  >
                    <div
                      style={{
                        height: "4px",
                        borderRadius: "999px",
                        background:
                          "#1e293b",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width:
                            passwordStrength.width,
                          height: "100%",
                          borderRadius:
                            "999px",
                          background:
                            passwordStrength.className ===
                            "weak"
                              ? "#ef4444"
                              : passwordStrength.className ===
                                "medium"
                              ? "#f59e0b"
                              : "#22c55e",
                          transition:
                            "width 0.25s ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        color:
                          passwordStrength.className ===
                          "weak"
                            ? "#f87171"
                            : passwordStrength.className ===
                              "medium"
                            ? "#fbbf24"
                            : "#4ade80",
                        fontSize: "12px",
                      }}
                    >
                      Password strength:{" "}
                      {passwordStrength.label}
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="form-group">
                <label>Confirm Password</label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                    style={{
                      paddingRight: "80px",
                      borderColor:
                        confirmPassword
                          ? passwordsMatch
                            ? "#22c55e"
                            : "#ef4444"
                          : undefined,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    disabled={loading}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      width: "auto",
                      padding: "6px 9px",
                      border: "none",
                      background:
                        "transparent",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {showConfirmPassword
                      ? "HIDE"
                      : "SHOW"}
                  </button>
                </div>

                {confirmPassword && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: passwordsMatch
                        ? "#4ade80"
                        : "#f87171",
                    }}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}
              </div>

              {/* ERROR */}

              {error && (
                <div
                  className="error-message"
                  style={{
                    marginTop: "8px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div
                  style={{
                    marginBottom: "15px",
                    padding: "13px 15px",
                    borderRadius: "10px",
                    background:
                      "rgba(34,197,94,0.10)",
                    border:
                      "1px solid rgba(34,197,94,0.20)",
                    color: "#86efac",
                    fontSize: "14px",
                  }}
                >
                  ✓ {success}
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "#4ade80",
                    }}
                  >
                    Redirecting you to login...
                  </div>
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingDepartments
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "15px",
                  border: "none",
                  borderRadius: "12px",
                  background:
                    loading
                      ? "#334155"
                      : "linear-gradient(90deg, #2563eb, #0891b2)",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  boxShadow: loading
                    ? "none"
                    : "0 12px 30px rgba(37,99,235,0.22)",
                }}
              >
                {loading
                  ? "Creating account..."
                  : "Create Student Account  →"}
              </button>
            </form>

            {/* LOGIN */}

            <div
              style={{
                marginTop: "22px",
                paddingTop: "20px",
                borderTop:
                  "1px solid rgba(148,163,184,0.10)",
                textAlign: "center",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#38bdf8",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* FOOTER */}

          <div
            style={{
              textAlign: "center",
              marginTop: "22px",
              color: "#475569",
              fontSize: "12px",
            }}
          >
            SmartAttend&nbsp;&nbsp;•&nbsp;&nbsp;
            QR-Based Attendance System
          </div>
        </div>
      </div>

      {/* RESPONSIVE OVERRIDE */}

      <style>
        {`
          @media (max-width: 900px) {
            .register-mobile-hide {
              display: none;
            }
          }

          @media (max-width: 900px) {
            body {
              overflow-x: hidden;
            }
          }

          @media (max-width: 640px) {
            .form-group input,
            .form-group select {
              font-size: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Register;