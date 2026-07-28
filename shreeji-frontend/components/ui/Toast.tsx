export default function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error" | "info" | "";
}) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        padding: "12px 18px",
        borderRadius: "var(--radius-sm)",
        color: "white",
        fontSize: "14px",
        fontWeight: 500,
        background:
          type === "success" ? "var(--color-success)"
          : type === "error" ? "var(--color-error)"
          : "var(--color-info)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {message}
    </div>
  );
}