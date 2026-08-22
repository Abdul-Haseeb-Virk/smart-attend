import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #f5f7fb 0%, #eef2ff 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "50px 40px",
          textAlign: "center",
          boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.10)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* ICON */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 25px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: "34px",
            fontWeight: 800,
          }}
        >
          !
        </div>

        {/* STATUS CODE */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#dc2626",
            marginBottom: "10px",
          }}
        >
          ERROR 403
        </div>

        {/* TITLE */}
        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "32px",
            color: "#111827",
          }}
        >
          Access Denied
        </h1>

        {/* DESCRIPTION */}
        <p
          style={{
            margin: "0 auto",
            maxWidth: "400px",
            lineHeight: 1.7,
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          You do not have permission to access
          this page. Please return to your
          dashboard and continue from there.
        </p>

        {/* BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: "9px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow:
                "0 5px 15px rgba(37, 99, 235, 0.25)",
            }}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "12px 24px",
              border: "1px solid #d1d5db",
              borderRadius: "9px",
              background: "#ffffff",
              color: "#374151",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>

        {/* BRAND */}
        <div
          style={{
            marginTop: "35px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          SmartAttend
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;