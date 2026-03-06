export default function Brevemente() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>NeoGeneralista</h1>
        <h2 style={styles.subtitle}>Disponível brevemente</h2>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#fafafa",
    fontFamily: "system-ui, -apple-system, sans-serif",
    textAlign: "center",
    padding: "2rem",
  },
  content: {
    maxWidth: "600px",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "800",
    color: "#111",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#eab308", // Tom de amarelo (Yellow Creative Studio)
    margin: "0 0 1.5rem 0",
  },
  text: {
    fontSize: "1.125rem",
    color: "#555",
    lineHeight: "1.6",
    margin: "0 0 2rem 0",
  },
  contact: {
    paddingTop: "2rem",
    borderTop: "1px solid #eaeaea",
    color: "#777",
    fontSize: "0.95rem",
  },
  link: {
    color: "#111",
    fontWeight: "600",
    textDecoration: "none",
    borderBottom: "2px solid #eab308",
  },
};