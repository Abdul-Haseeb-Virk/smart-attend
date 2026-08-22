import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/api";

function StudentScan() {
  const navigate = useNavigate();

  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  /*
   * This ref prevents multiple API requests
   * when the same QR code is detected repeatedly.
   */
  const processingRef = useRef(false);

  const [scanning, setScanning] =
    useState(false);

  const [cameraStarting, setCameraStarting] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * ==========================================
   * STOP SCANNER
   * ==========================================
   */

  const stopScanner = async () => {
    const scanner =
      scannerRef.current;

    if (!scanner) {
      setScanning(false);
      return;
    }

    try {
      await scanner.stop();
    } catch (error) {
      console.error(
        "Scanner stop error:",
        error
      );
    }

    try {
      await scanner.clear();
    } catch (error) {
      console.error(
        "Scanner clear error:",
        error
      );
    }

    scannerRef.current = null;

    setScanning(false);
  };

  /*
   * ==========================================
   * MARK ATTENDANCE
   * ==========================================
   */

  const markAttendance = async (
    qrToken: string
  ) => {
    /*
     * Very important:
     *
     * html5-qrcode can detect the same QR
     * several times within a second.
     *
     * Prevent duplicate requests.
     */
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;

    try {
      setProcessing(true);
      setError("");
      setMessage(
        "Verifying attendance..."
      );

      await stopScanner();

      const response =
        await api.post(
          "/attendance/mark",
          {
            token: qrToken,
          }
        );

      setMessage(
        response.data?.message ||
          "Attendance marked successfully"
      );
    } catch (error: any) {
      console.error(
        "Mark attendance error:",
        error
      );

      setMessage("");

      setError(
        error.response?.data?.message ||
          "Failed to mark attendance"
      );

      processingRef.current = false;
      setProcessing(false);
    }
  };

  /*
   * ==========================================
   * START CAMERA
   * ==========================================
   */

  const startScanner = async () => {
    if (
      cameraStarting ||
      scanning ||
      processing
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      processingRef.current = false;

      setProcessing(false);
      setCameraStarting(true);

      /*
       * Make sure an old scanner does not
       * remain attached to the DOM.
       */
      if (scannerRef.current) {
        await stopScanner();
      }

      const scanner =
        new Html5Qrcode(
          "student-qr-reader"
        );

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,

          qrbox: {
            width: 270,
            height: 270,
          },

          aspectRatio: 1,
        },
        (decodedText) => {
          markAttendance(
            decodedText
          );
        },
        () => {
          /*
           * Normal scanner failures are
           * intentionally ignored.
           *
           * html5-qrcode calls this whenever
           * a frame does not contain a QR code.
           */
        }
      );

      setScanning(true);
    } catch (error) {
      console.error(
        "Start scanner error:",
        error
      );

      scannerRef.current = null;

      setScanning(false);

      setError(
        "Unable to access your camera. Please allow camera permission and try again."
      );
    } finally {
      setCameraStarting(false);
    }
  };

  /*
   * ==========================================
   * RETRY
   * ==========================================
   */

  const retryScan = async () => {
    await stopScanner();

    processingRef.current = false;

    setError("");
    setMessage("");
    setProcessing(false);

    await startScanner();
  };

  /*
   * ==========================================
   * CLEANUP
   * ==========================================
   */

  useEffect(() => {
    return () => {
      const scanner =
        scannerRef.current;

      if (scanner) {
        scanner
          .stop()
          .then(() => {
            scanner.clear();
          })
          .catch(() => {});

        scannerRef.current = null;
      }
    };
  }, []);

  /*
   * ==========================================
   * SUCCESS SCREEN
   * ==========================================
   */

  if (message && !error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          boxSizing: "border-box",
          padding: "30px 20px",
          background:
            "radial-gradient(circle at 15% 10%, rgba(34,197,94,0.18), transparent 32%), radial-gradient(circle at 85% 90%, rgba(6,182,212,0.12), transparent 32%), #06101e",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              margin: "0 auto 24px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(34,197,94,0.10)",
              border:
                "1px solid rgba(74,222,128,0.25)",
              boxShadow:
                "0 0 60px rgba(34,197,94,0.18)",
            }}
          >
            <span
              style={{
                fontSize: "50px",
                color: "#4ade80",
                fontWeight: 800,
              }}
            >
              ✓
            </span>
          </div>

          <div
            style={{
              padding: "36px 30px",
              borderRadius: "24px",
              background:
                "rgba(255,255,255,0.055)",
              border:
                "1px solid rgba(255,255,255,0.10)",
              backdropFilter:
                "blur(18px)",
              boxShadow:
                "0 30px 90px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                padding: "7px 12px",
                borderRadius: "999px",
                background:
                  "rgba(34,197,94,0.10)",
                border:
                  "1px solid rgba(34,197,94,0.20)",
                color: "#86efac",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.4px",
                textTransform:
                  "uppercase",
                marginBottom: "15px",
              }}
            >
              Attendance Recorded
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-0.8px",
              }}
            >
              Attendance Successful
            </h1>

            <p
              style={{
                margin: "0 auto 24px",
                maxWidth: "430px",
                color: "#94a3b8",
                lineHeight: 1.7,
                fontSize: "14px",
              }}
            >
              {message}
            </p>

            <div
              style={{
                padding: "16px",
                marginBottom: "24px",
                borderRadius: "14px",
                background:
                  "rgba(34,197,94,0.07)",
                border:
                  "1px solid rgba(34,197,94,0.15)",
                color: "#bbf7d0",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Your attendance has been
              successfully recorded for
              this class session.
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/student")
              }
              style={{
                width: "100%",
                padding: "14px 20px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #16a34a, #06b6d4)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow:
                  "0 12px 30px rgba(6,182,212,0.18)",
              }}
            >
              Back to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================
   * MAIN PAGE
   * ==========================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "30px 20px 50px",
        background:
          "radial-gradient(circle at 10% 5%, rgba(37,99,235,0.18), transparent 34%), radial-gradient(circle at 90% 95%, rgba(6,182,212,0.12), transparent 34%), #06101e",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 13px",
              borderRadius: "999px",
              background:
                "rgba(37,99,235,0.10)",
              border:
                "1px solid rgba(96,165,250,0.18)",
              color: "#93c5fd",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.2px",
              textTransform:
                "uppercase",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22d3ee",
                boxShadow:
                  "0 0 12px rgba(34,211,238,0.7)",
              }}
            />

            Smart Attendance
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "34px",
              fontWeight: 800,
              letterSpacing: "-0.8px",
            }}
          >
            Scan Attendance QR
          </h1>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              lineHeight: 1.6,
              fontSize: "14px",
            }}
          >
            Scan the live QR code displayed
            by your professor to mark your
            attendance.
          </p>
        </div>

        {/* MAIN CARD */}

        <div
          style={{
            padding: "24px",
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
          {/* STATUS BAR */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "15px",
              marginBottom: "20px",
              padding: "13px 15px",
              borderRadius: "12px",
              background:
                scanning
                  ? "rgba(34,197,94,0.07)"
                  : cameraStarting
                  ? "rgba(245,158,11,0.07)"
                  : "rgba(255,255,255,0.035)",
              border:
                scanning
                  ? "1px solid rgba(34,197,94,0.18)"
                  : cameraStarting
                  ? "1px solid rgba(245,158,11,0.18)"
                  : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background:
                    scanning
                      ? "#22c55e"
                      : cameraStarting
                      ? "#f59e0b"
                      : "#64748b",
                  boxShadow:
                    scanning
                      ? "0 0 12px rgba(34,197,94,0.7)"
                      : "none",
                }}
              />

              <span
                style={{
                  color:
                    scanning
                      ? "#86efac"
                      : cameraStarting
                      ? "#fcd34d"
                      : "#94a3b8",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {scanning
                  ? "Camera Active"
                  : cameraStarting
                  ? "Starting Camera..."
                  : processing
                  ? "Verifying Attendance"
                  : "Camera Ready"}
              </span>
            </div>

            {scanning && (
              <span
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Live scanning
              </span>
            )}
          </div>

          {/* CAMERA */}

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "560px",
              minHeight:
                scanning ||
                cameraStarting
                  ? "400px"
                  : "120px",
              margin: "0 auto",
              borderRadius: "20px",
              overflow: "hidden",
              background: "#000",
              border:
                "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              id="student-qr-reader"
              style={{
                width: "100%",
              }}
            />

            {/* SCANNER FRAME */}

            {scanning && (
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    width: "35px",
                    height: "35px",
                    borderTop:
                      "3px solid #22d3ee",
                    borderLeft:
                      "3px solid #22d3ee",
                    borderRadius:
                      "8px 0 0 0",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    width: "35px",
                    height: "35px",
                    borderTop:
                      "3px solid #22d3ee",
                    borderRight:
                      "3px solid #22d3ee",
                    borderRadius:
                      "0 8px 0 0",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    width: "35px",
                    height: "35px",
                    borderBottom:
                      "3px solid #22d3ee",
                    borderLeft:
                      "3px solid #22d3ee",
                    borderRadius:
                      "0 0 0 8px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    width: "35px",
                    height: "35px",
                    borderBottom:
                      "3px solid #22d3ee",
                    borderRight:
                      "3px solid #22d3ee",
                    borderRadius:
                      "0 0 8px 0",
                  }}
                />
              </div>
            )}

            {/* CAMERA LOADING */}

            {cameraStarting && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  background:
                    "rgba(0,0,0,0.72)",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border:
                      "4px solid rgba(255,255,255,0.12)",
                    borderTopColor:
                      "#22d3ee",
                    animation:
                      "studentScanSpin 1s linear infinite",
                  }}
                />

                <span
                  style={{
                    color: "#cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  Starting camera...
                </span>
              </div>
            )}
          </div>

          {/* READY STATE */}

          {!scanning &&
            !processing &&
            !cameraStarting &&
            !error && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "25px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    margin:
                      "0 auto 15px",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "rgba(37,99,235,0.12)",
                    border:
                      "1px solid rgba(96,165,250,0.18)",
                    fontSize: "26px",
                  }}
                >
                  ◉
                </div>

                <h2
                  style={{
                    margin:
                      "0 0 8px",
                    fontSize: "20px",
                  }}
                >
                  Ready to scan
                </h2>

                <p
                  style={{
                    margin:
                      "0 auto 20px",
                    maxWidth: "430px",
                    color: "#94a3b8",
                    lineHeight: 1.6,
                    fontSize: "14px",
                  }}
                >
                  Position your phone so
                  the professor's QR code
                  appears inside the
                  scanning area.
                </p>

                <button
                  type="button"
                  onClick={startScanner}
                  style={{
                    minWidth: "190px",
                    padding:
                      "13px 22px",
                    border: "none",
                    borderRadius: "11px",
                    background:
                      "linear-gradient(135deg, #2563eb, #06b6d4)",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow:
                      "0 10px 30px rgba(37,99,235,0.25)",
                  }}
                >
                  Start Camera
                </button>
              </div>
            )}

          {/* SCANNING MESSAGE */}

          {scanning && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "13px",
                background:
                  "rgba(37,99,235,0.07)",
                border:
                  "1px solid rgba(96,165,250,0.12)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#67e8f9",
                  fontWeight: 700,
                  fontSize: "14px",
                  marginBottom: "5px",
                }}
              >
                Point your camera at
                the QR code
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Keep the QR inside the
                frame until it is detected.
              </div>
            </div>
          )}

          {/* PROCESSING */}

          {processing && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "14px",
                background:
                  "rgba(245,158,11,0.08)",
                border:
                  "1px solid rgba(245,158,11,0.18)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  margin:
                    "0 auto 12px",
                  borderRadius: "50%",
                  border:
                    "3px solid rgba(255,255,255,0.12)",
                  borderTopColor:
                    "#fbbf24",
                  animation:
                    "studentScanSpin 1s linear infinite",
                }}
              />

              <strong
                style={{
                  display: "block",
                  color: "#fde68a",
                  marginBottom: "5px",
                }}
              >
                Verifying attendance
              </strong>

              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                Please wait while we
                verify your QR code.
              </span>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "22px",
                borderRadius: "16px",
                background:
                  "rgba(239,68,68,0.08)",
                border:
                  "1px solid rgba(239,68,68,0.20)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin:
                    "0 auto 12px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(239,68,68,0.12)",
                  color: "#f87171",
                  fontSize: "22px",
                  fontWeight: 800,
                }}
              >
                !
              </div>

              <h3
                style={{
                  margin:
                    "0 0 8px",
                  color: "#fca5a5",
                }}
              >
                Attendance Failed
              </h3>

              <p
                style={{
                  margin:
                    "0 auto 18px",
                  maxWidth: "480px",
                  color: "#94a3b8",
                  lineHeight: 1.6,
                  fontSize: "13px",
                }}
              >
                {error}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent:
                    "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={retryScan}
                  disabled={cameraStarting}
                  style={{
                    padding:
                      "11px 22px",
                    border: "none",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, #dc2626, #f97316)",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor:
                      cameraStarting
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      cameraStarting
                        ? 0.6
                        : 1,
                  }}
                >
                  Try Again
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/student"
                    )
                  }
                  style={{
                    padding:
                      "11px 22px",
                    border:
                      "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "10px",
                    background:
                      "transparent",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    cursor:
                      "pointer",
                  }}
                >
                  Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STOP CAMERA */}

          {scanning && (
            <button
              type="button"
              onClick={stopScanner}
              style={{
                display: "block",
                margin:
                  "20px auto 0",
                padding:
                  "10px 18px",
                border:
                  "1px solid rgba(255,255,255,0.10)",
                borderRadius: "10px",
                background:
                  "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Stop Camera
            </button>
          )}
        </div>

        {/* TIPS */}

        {!processing &&
          !error && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginTop: "18px",
              }}
            >
              {[
                {
                  title:
                    "Good lighting",
                  text:
                    "Make sure the professor's screen is clearly visible.",
                },
                {
                  title:
                    "Hold steady",
                  text:
                    "Keep the QR inside the scanning area for a moment.",
                },
                {
                  title:
                    "Use the live QR",
                  text:
                    "The QR changes automatically and old codes expire.",
                },
              ].map((tip) => (
                <div
                  key={tip.title}
                  style={{
                    padding: "17px",
                    borderRadius: "14px",
                    background:
                      "rgba(255,255,255,0.035)",
                    border:
                      "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    style={{
                      color: "#67e8f9",
                      fontSize: "13px",
                      fontWeight: 800,
                      marginBottom:
                        "6px",
                    }}
                  >
                    {tip.title}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {tip.text}
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* BACK */}

        {!processing &&
          !scanning &&
          !error && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student"
                )
              }
              style={{
                display: "block",
                margin:
                  "22px auto 0",
                padding:
                  "11px 20px",
                border:
                  "1px solid rgba(255,255,255,0.10)",
                borderRadius: "10px",
                background:
                  "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              ← Back to Student Dashboard
            </button>
          )}
      </div>

      <style>
        {`
          @keyframes studentScanSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          #student-qr-reader video {
            width: 100% !important;
            border-radius: 18px;
          }

          #student-qr-reader {
            border: none !important;
          }

          #student-qr-reader__dashboard {
            display: none !important;
          }

          #student-qr-reader__scan_region {
            border: none !important;
          }

          @media (max-width: 600px) {
            h1 {
              font-size: 28px !important;
            }

            #student-qr-reader {
              min-height: 300px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default StudentScan;