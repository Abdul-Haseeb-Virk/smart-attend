import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "../api/api";

type QRData = {
  sessionId: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  data: string;
  image: string;
  rotationSeconds: number;
  generatedAt: string;
  validFrom: string;
  validUntil: string;
  sessionExpiresAt: string;
};

function AttendanceQR() {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionId =
    location.state?.sessionId;

  const [qr, setQr] =
    useState<QRData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  const [sessionSecondsLeft, setSessionSecondsLeft] =
    useState(0);

  const [copied, setCopied] =
    useState(false);

  const [fullscreen, setFullscreen] =
    useState(false);

  /*
   * ==========================================
   * LOAD QR
   * ==========================================
   */

  const loadQR = useCallback(
    async (manual = false) => {
      if (!sessionId) {
        setError(
          "Attendance session not found"
        );

        setLoading(false);

        return;
      }

      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await api.get(
          `/attendance-qr/${sessionId}`
        );

        const qrData =
          response.data.qr as QRData;

        setQr(qrData);
        setError("");
        setCopied(false);

        const validUntil =
          new Date(
            qrData.validUntil
          ).getTime();

        const sessionExpiresAt =
          new Date(
            qrData.sessionExpiresAt
          ).getTime();

        setSecondsLeft(
          Math.max(
            0,
            Math.ceil(
              (validUntil -
                Date.now()) /
                1000
            )
          )
        );

        setSessionSecondsLeft(
          Math.max(
            0,
            Math.ceil(
              (sessionExpiresAt -
                Date.now()) /
                1000
            )
          )
        );
      } catch (error: any) {
        console.error(
          "QR loading error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load QR code"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sessionId]
  );

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadQR();
  }, [loadQR]);

  /*
   * ==========================================
   * AUTOMATIC QR REFRESH
   * ==========================================
   *
   * The backend rotates the QR every
   * rotationSeconds seconds.
   *
   * We refresh slightly after the
   * rotation boundary.
   */

  useEffect(() => {
    if (!qr) {
      return;
    }

    const interval = setInterval(() => {
      loadQR();
    }, qr.rotationSeconds * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [qr, loadQR]);

  /*
   * ==========================================
   * LIVE COUNTDOWN
   * ==========================================
   */

  useEffect(() => {
    if (!qr) {
      return;
    }

    const timer = setInterval(() => {
      const now =
        Date.now();

      const validUntil =
        new Date(
          qr.validUntil
        ).getTime();

      const sessionExpiresAt =
        new Date(
          qr.sessionExpiresAt
        ).getTime();

      setSecondsLeft(
        Math.max(
          0,
          Math.ceil(
            (validUntil -
              now) /
              1000
          )
        )
      );

      setSessionSecondsLeft(
        Math.max(
          0,
          Math.ceil(
            (sessionExpiresAt -
              now) /
              1000
          )
        )
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [qr]);

  /*
   * ==========================================
   * SESSION EXPIRED
   * ==========================================
   */

  useEffect(() => {
    if (
      qr &&
      sessionSecondsLeft === 0
    ) {
      setError(
        "This attendance session has expired."
      );
    }
  }, [qr, sessionSecondsLeft]);

  /*
   * ==========================================
   * COPY QR DATA
   * ==========================================
   */

  const copyQRData = async () => {
    if (!qr) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        qr.data
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy QR data error:",
        error
      );
    }
  };

  /*
   * ==========================================
   * FULLSCREEN
   * ==========================================
   */

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();

        setFullscreen(true);
      } else {
        await document.exitFullscreen();

        setFullscreen(false);
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  /*
   * Keep React state synchronized
   * if fullscreen is exited using
   * the browser controls.
   */

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(
        Boolean(
          document.fullscreenElement
        )
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  /*
   * ==========================================
   * FORMATTING HELPERS
   * ==========================================
   */

  const formatTime = (
    totalSeconds: number
  ) => {
    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  };

  const sessionProgress =
    useMemo(() => {
      if (!qr) {
        return 0;
      }

      const total =
        new Date(
          qr.sessionExpiresAt
        ).getTime() -
        new Date(
          qr.generatedAt
        ).getTime();

      if (total <= 0) {
        return 0;
      }

      const remaining =
        sessionSecondsLeft * 1000;

      return Math.min(
        100,
        Math.max(
          0,
          (remaining /
            total) *
            100
        )
      );
    }, [
      qr,
      sessionSecondsLeft,
    ]);

  const qrProgress =
    useMemo(() => {
      if (!qr) {
        return 0;
      }

      return Math.min(
        100,
        Math.max(
          0,
          (secondsLeft /
            qr.rotationSeconds) *
            100
        )
      );
    }, [
      qr,
      secondsLeft,
    ]);

  /*
   * ==========================================
   * SESSION NOT FOUND
   * ==========================================
   */

  if (!sessionId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background:
            "linear-gradient(135deg, #07111f, #0b1730)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            padding: "40px",
            borderRadius: "24px",
            background:
              "rgba(255,255,255,0.07)",
            border:
              "1px solid rgba(255,255,255,0.12)",
            textAlign: "center",
            boxShadow:
              "0 25px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              margin:
                "0 auto 20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(239,68,68,0.15)",
              color: "#f87171",
              fontSize: "32px",
            }}
          >
            !
          </div>

          <h1
            style={{
              margin:
                "0 0 12px",
              fontSize: "28px",
            }}
          >
            Attendance Session Not Found
          </h1>

          <p
            style={{
              margin:
                "0 0 28px",
              color: "#a8b4c7",
              lineHeight: 1.6,
            }}
          >
            The attendance session could
            not be found. Please return to
            your dashboard and start a new
            session.
          </p>

          <button
            onClick={() =>
              navigate(
                "/professor"
              )
            }
            style={{
              width: "100%",
              border: "none",
              borderRadius: "12px",
              padding: "14px 20px",
              background:
                "linear-gradient(135deg, #2563eb, #06b6d4)",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
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
        padding: fullscreen
          ? "28px"
          : "32px 24px 50px",
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(6,182,212,0.12), transparent 35%), #06101e",
        color: "#ffffff",
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
        {/* ======================================
            TOP BAR
            ====================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    sessionSecondsLeft > 0
                      ? "#22c55e"
                      : "#ef4444",
                  boxShadow:
                    sessionSecondsLeft > 0
                      ? "0 0 15px rgba(34,197,94,0.8)"
                      : "none",
                }}
              />

              <span
                style={{
                  color:
                    sessionSecondsLeft > 0
                      ? "#86efac"
                      : "#fca5a5",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "1.5px",
                }}
              >
                {sessionSecondsLeft > 0
                  ? "Live Attendance"
                  : "Session Expired"}
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  fullscreen
                    ? "32px"
                    : "28px",
                fontWeight: 800,
                letterSpacing:
                  "-0.5px",
              }}
            >
              Attendance QR
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                loadQR(true)
              }
              disabled={refreshing}
              style={{
                border:
                  "1px solid rgba(255,255,255,0.14)",
                background:
                  "rgba(255,255,255,0.06)",
                color: "#ffffff",
                borderRadius: "10px",
                padding:
                  "11px 15px",
                cursor: refreshing
                  ? "not-allowed"
                  : "pointer",
                opacity: refreshing
                  ? 0.6
                  : 1,
              }}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              onClick={
                toggleFullscreen
              }
              style={{
                border: "none",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                color: "#ffffff",
                borderRadius: "10px",
                padding:
                  "11px 16px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {fullscreen
                ? "Exit Fullscreen"
                : "Fullscreen"}
            </button>
          </div>
        </div>

        {/* ======================================
            ERROR
            ====================================== */}

        {error && (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px 18px",
              borderRadius: "14px",
              background:
                "rgba(239,68,68,0.10)",
              border:
                "1px solid rgba(239,68,68,0.30)",
              color: "#fca5a5",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <span>
              {error}
            </span>

            <button
              onClick={() =>
                loadQR(true)
              }
              style={{
                border:
                  "1px solid rgba(239,68,68,0.4)",
                background:
                  "transparent",
                color: "#fecaca",
                borderRadius: "8px",
                padding:
                  "8px 12px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ======================================
            LOADING
            ====================================== */}

        {loading && !qr && (
          <div
            style={{
              minHeight: "500px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection:
                "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border:
                  "4px solid rgba(255,255,255,0.12)",
                borderTopColor:
                  "#22d3ee",
                animation:
                  "spin 1s linear infinite",
              }}
            />

            <p
              style={{
                color: "#94a3b8",
              }}
            >
              Generating live QR code...
            </p>
          </div>
        )}

        {/* ======================================
            QR CONTENT
            ====================================== */}

        {qr && (
          <>
            {/* COURSE HEADER */}

            <div
              style={{
                padding:
                  fullscreen
                    ? "18px 22px"
                    : "20px 24px",
                marginBottom: "20px",
                borderRadius: "18px",
                background:
                  "rgba(255,255,255,0.055)",
                border:
                  "1px solid rgba(255,255,255,0.10)",
                backdropFilter:
                  "blur(16px)",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#67e8f9",
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing:
                      "1.5px",
                    marginBottom: "6px",
                  }}
                >
                  {qr.courseCode}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      fullscreen
                        ? "24px"
                        : "21px",
                  }}
                >
                  {qr.courseName}
                </h2>
              </div>

              <div
                style={{
                  padding:
                    "10px 14px",
                  borderRadius: "10px",
                  background:
                    "rgba(34,197,94,0.10)",
                  border:
                    "1px solid rgba(34,197,94,0.20)",
                  color: "#86efac",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Session #{qr.sessionId}
              </div>
            </div>

            {/* MAIN GRID */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  fullscreen
                    ? "minmax(420px, 1fr) 360px"
                    : "minmax(350px, 1fr) minmax(280px, 380px)",
                gap: "22px",
                alignItems:
                  "stretch",
              }}
            >
              {/* ==================================
                  QR CARD
                  ================================== */}

              <div
                style={{
                  minHeight:
                    fullscreen
                      ? "650px"
                      : "600px",
                  borderRadius: "24px",
                  padding:
                    fullscreen
                      ? "32px"
                      : "28px",
                  background:
                    "rgba(255,255,255,0.97)",
                  display: "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  boxShadow:
                    "0 30px 90px rgba(0,0,0,0.35)",
                  position:
                    "relative",
                  overflow:
                    "hidden",
                }}
              >
                {/* QR LABEL */}

                <div
                  style={{
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "1.5px",
                    marginBottom:
                      "20px",
                  }}
                >
                  Scan to Mark Attendance
                </div>

                {/* QR IMAGE */}

                <div
                  style={{
                    padding:
                      fullscreen
                        ? "22px"
                        : "18px",
                    borderRadius:
                      "20px",
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e2e8f0",
                    boxShadow:
                      "0 15px 50px rgba(15,23,42,0.12)",
                  }}
                >
                  <img
                    src={qr.image}
                    alt="Live attendance QR code"
                    style={{
                      width:
                        fullscreen
                          ? "430px"
                          : "350px",
                      height:
                        fullscreen
                          ? "430px"
                          : "350px",
                      maxWidth:
                        "70vw",
                      maxHeight:
                        "55vh",
                      display:
                        "block",
                      objectFit:
                        "contain",
                    }}
                  />
                </div>

                {/* QR COUNTDOWN */}

                <div
                  style={{
                    marginTop: "24px",
                    textAlign:
                      "center",
                    width: "100%",
                    maxWidth:
                      "450px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: "8px",
                      color: "#334155",
                      fontSize: "14px",
                      marginBottom:
                        "10px",
                    }}
                  >
                    <span>
                      QR changes in
                    </span>

                    <strong
                      style={{
                        color:
                          secondsLeft <= 3
                            ? "#dc2626"
                            : "#2563eb",
                        fontSize:
                          "20px",
                      }}
                    >
                      {secondsLeft}s
                    </strong>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "7px",
                      borderRadius:
                        "999px",
                      background:
                        "#e2e8f0",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        height:
                          "100%",
                        width: `${qrProgress}%`,
                        background:
                          secondsLeft <= 3
                            ? "#ef4444"
                            : "#2563eb",
                        borderRadius:
                          "999px",
                        transition:
                          "width 0.5s linear",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ==================================
                  SESSION INFORMATION
                  ================================== */}

              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "16px",
                }}
              >
                {/* SESSION TIMER */}

                <div
                  style={{
                    padding: "24px",
                    borderRadius:
                      "20px",
                    background:
                      "linear-gradient(135deg, rgba(37,99,235,0.20), rgba(6,182,212,0.10))",
                    border:
                      "1px solid rgba(96,165,250,0.20)",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#93c5fd",
                      fontSize:
                        "12px",
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "1.3px",
                      marginBottom:
                        "10px",
                    }}
                  >
                    Session Remaining
                  </div>

                  <div
                    style={{
                      fontSize:
                        "42px",
                      fontWeight:
                        800,
                      letterSpacing:
                        "-1px",
                    }}
                  >
                    {formatTime(
                      sessionSecondsLeft
                    )}
                  </div>

                  <div
                    style={{
                      marginTop:
                        "16px",
                      width: "100%",
                      height: "6px",
                      borderRadius:
                        "999px",
                      background:
                        "rgba(255,255,255,0.10)",
                      overflow:
                        "hidden",
                    }}
                  >
                    <div
                      style={{
                        height:
                          "100%",
                        width: `${sessionProgress}%`,
                        background:
                          "#38bdf8",
                        borderRadius:
                          "999px",
                        transition:
                          "width 1s linear",
                      }}
                    />
                  </div>

                  <p
                    style={{
                      color:
                        "#94a3b8",
                      fontSize:
                        "13px",
                      margin:
                        "12px 0 0",
                    }}
                  >
                    Keep this screen open
                    while students scan.
                  </p>
                </div>

                {/* INSTRUCTIONS */}

                <div
                  style={{
                    padding: "22px",
                    borderRadius:
                      "20px",
                    background:
                      "rgba(255,255,255,0.055)",
                    border:
                      "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 16px",
                      fontSize:
                        "17px",
                    }}
                  >
                    How it works
                  </h3>

                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "14px",
                    }}
                  >
                    {[
                      [
                        "01",
                        "Display this QR",
                      ],
                      [
                        "02",
                        "Students scan using Smart Attend",
                      ],
                      [
                        "03",
                        "QR automatically changes",
                      ],
                      [
                        "04",
                        "Attendance is recorded instantly",
                      ],
                    ].map(
                      (item) => (
                        <div
                          key={
                            item[0]
                          }
                          style={{
                            display:
                              "flex",
                            gap: "12px",
                            alignItems:
                              "center",
                          }}
                        >
                          <div
                            style={{
                              minWidth:
                                "34px",
                              height:
                                "34px",
                              borderRadius:
                                "10px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "rgba(37,99,235,0.15)",
                              color:
                                "#67e8f9",
                              fontSize:
                                "11px",
                              fontWeight:
                                800,
                            }}
                          >
                            {
                              item[0]
                            }
                          </div>

                          <span
                            style={{
                              color:
                                "#cbd5e1",
                              fontSize:
                                "13px",
                              lineHeight:
                                1.4,
                            }}
                          >
                            {
                              item[1]
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* SESSION DETAILS */}

                <div
                  style={{
                    padding: "22px",
                    borderRadius:
                      "20px",
                    background:
                      "rgba(255,255,255,0.055)",
                    border:
                      "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 16px",
                      fontSize:
                        "17px",
                    }}
                  >
                    Session Details
                  </h3>

                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "15px",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#64748b",
                        }}
                      >
                        QR Rotation
                      </span>

                      <strong>
                        {
                          qr.rotationSeconds
                        }s
                      </strong>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "15px",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#64748b",
                        }}
                      >
                        Session Ends
                      </span>

                      <strong>
                        {new Date(
                          qr.sessionExpiresAt
                        ).toLocaleTimeString()}
                      </strong>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: "15px",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#64748b",
                        }}
                      >
                        Current QR
                      </span>

                      <strong>
                        {secondsLeft >
                        0
                          ? "Valid"
                          : "Refreshing"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={
                      copyQRData
                    }
                    style={{
                      padding:
                        "12px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      background:
                        "rgba(255,255,255,0.06)",
                      color:
                        "#ffffff",
                      cursor:
                        "pointer",
                      fontWeight:
                        600,
                    }}
                  >
                    {copied
                      ? "✓ Copied"
                      : "Copy QR Data"}
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "/professor/attendance-report",
                        {
                          state: {
                            sessionId:
                              qr.sessionId,
                            courseId:
                              qr.courseId,
                          },
                        }
                      )
                    }
                    style={{
                      padding:
                        "12px",
                      borderRadius:
                        "10px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #2563eb, #06b6d4)",
                      color:
                        "#ffffff",
                      cursor:
                        "pointer",
                      fontWeight:
                        700,
                    }}
                  >
                    Attendance Report
                  </button>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/professor"
                    )
                  }
                  style={{
                    width: "100%",
                    padding:
                      "13px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(255,255,255,0.12)",
                    background:
                      "transparent",
                    color:
                      "#94a3b8",
                    cursor:
                      "pointer",
                    fontWeight:
                      600,
                  }}
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================
          ANIMATION
          ======================================== */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            body {
              overflow-x: hidden;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AttendanceQR;