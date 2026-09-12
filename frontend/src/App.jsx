import Home from "./pages/Home";

function App() {
  return (
    <div className="app">
      {/* Animated background shapes */}
      <div className="background-orb orb-one"></div>
      <div className="background-orb orb-two"></div>
      <div className="background-orb orb-three"></div>

      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">🛡️</div>

          <div>
            <span>ScamShield</span>
            <b> Pay</b>
          </div>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          <span>Protection Active</span>
        </div>
      </nav>

      <Home />

      <footer>
        <div className="footer-shield">🛡️</div>

        <p>
          ScamShield Pay provides risk analysis, not a guarantee that a
          message is legitimate or fraudulent.
        </p>

        <p className="footer-small">
          Stay alert. Verify before you trust.
        </p>
      </footer>
    </div>
  );
}

export default App;