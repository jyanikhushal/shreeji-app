import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)",
    }}>
      <Spinner size={32} color="#2563eb" />
    </div>
  );
}