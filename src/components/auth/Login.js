import axios from "axios";
import { useState } from "react";
import { Col, Container, Row, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    axios
      .get("http://localhost:9999/users")
      .then((result) => {
        const user = result.data;
        const acc = user.find((a) => a.email === email);

        if (!acc) {
          alert("Tài khoản Email không tồn tại");
          return;
        }

        const checkPass = bcrypt.compareSync(password, acc.password);

        if (!checkPass) {
          alert("Mật khẩu sai");
          return;
        }
        if (acc.status === "inactive") {
          alert(
            "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."
          );
          return;
        }
        localStorage.setItem("userAccount", JSON.stringify(acc));

        // Chuyển hướng theo role
        if (acc.role === "Admin") {
          navigate("/admin/dashboard");
        } else if (acc.role === "Librarian") {
          navigate("/librarian/dashboard");
        } else {
          navigate("/homepage");
        }
      })
      .catch((err) => console.error(err));
  };

  // SVG illustration for login
  const LibraryIllustration = () => (
    <svg viewBox="0 0 400 300" style={{ width: "100%", maxWidth: "350px" }}>
      {/* Background circle */}
      <circle cx="200" cy="150" r="120" fill="#e8f5e9" />
      <circle cx="200" cy="150" r="90" fill="#c8e6c9" />

      {/* Bookshelf */}
      <rect x="100" y="180" width="200" height="15" rx="3" fill="#43a047" />
      <rect x="100" y="220" width="200" height="15" rx="3" fill="#43a047" />

      {/* Books on shelf 1 */}
      <rect x="110" y="130" width="25" height="50" rx="2" fill="#2e7d32" />
      <rect x="140" y="140" width="20" height="40" rx="2" fill="#66bb6a" />
      <rect x="165" y="125" width="22" height="55" rx="2" fill="#388e3c" />
      <rect x="192" y="135" width="18" height="45" rx="2" fill="#4caf50" />
      <rect x="215" y="128" width="24" height="52" rx="2" fill="#1b5e20" />
      <rect x="244" y="138" width="20" height="42" rx="2" fill="#81c784" />
      <rect x="269" y="132" width="22" height="48" rx="2" fill="#2e7d32" />

      {/* Books on shelf 2 */}
      <rect x="115" y="195" width="22" height="25" rx="2" fill="#4caf50" />
      <rect x="142" y="198" width="18" height="22" rx="2" fill="#2e7d32" />
      <rect x="165" y="193" width="25" height="27" rx="2" fill="#81c784" />
      <rect x="195" y="196" width="20" height="24" rx="2" fill="#388e3c" />
      <rect x="220" y="192" width="23" height="28" rx="2" fill="#66bb6a" />
      <rect x="248" y="197" width="18" height="23" rx="2" fill="#1b5e20" />
      <rect x="271" y="194" width="22" height="26" rx="2" fill="#43a047" />

      {/* Open book */}
      <ellipse cx="200" cy="85" rx="50" ry="8" fill="#a5d6a7" />
      <path
        d="M150 85 Q175 70 200 75 Q225 70 250 85 L250 45 Q225 35 200 40 Q175 35 150 45 Z"
        fill="#ffffff"
        stroke="#43a047"
        strokeWidth="2"
      />
      <line
        x1="200"
        y1="40"
        x2="200"
        y2="75"
        stroke="#c8e6c9"
        strokeWidth="1"
      />
      <line
        x1="160"
        y1="50"
        x2="195"
        y2="55"
        stroke="#e8f5e9"
        strokeWidth="1"
      />
      <line
        x1="160"
        y1="58"
        x2="195"
        y2="63"
        stroke="#e8f5e9"
        strokeWidth="1"
      />
      <line
        x1="205"
        y1="55"
        x2="240"
        y2="50"
        stroke="#e8f5e9"
        strokeWidth="1"
      />
      <line
        x1="205"
        y1="63"
        x2="240"
        y2="58"
        stroke="#e8f5e9"
        strokeWidth="1"
      />

      {/* Decorative leaves */}
      <path d="M80 100 Q90 80 110 90 Q100 100 80 100" fill="#66bb6a" />
      <path d="M320 200 Q330 180 350 190 Q340 200 320 200" fill="#4caf50" />
      <path d="M70 200 Q85 185 100 195 Q85 205 70 200" fill="#81c784" />
      <path d="M300 80 Q315 65 330 75 Q315 85 300 80" fill="#a5d6a7" />

      {/* Small circles decoration */}
      <circle cx="330" cy="120" r="5" fill="#c8e6c9" />
      <circle cx="70" cy="150" r="4" fill="#a5d6a7" />
      <circle cx="340" cy="170" r="3" fill="#81c784" />
      <circle cx="60" cy="180" r="4" fill="#66bb6a" />
    </svg>
  );

  return (
    <Container className="login-container" fluid>
      <Row
        className="d-flex justify-content-center align-items-center auth-container"
        style={{ maxWidth: "950px" }}
      >
        {/* Illustration Section */}
        <Col
          lg={6}
          className="login-logo-col d-flex justify-content-center align-items-center p-4"
        >
          <LibraryIllustration />
        </Col>

        {/* Form Section */}
        <Col lg={6} md={10} className="px-4 py-4">
          <div className="text-center mb-4">
            {/* Icon */}
            <div className="auth-icon">
              <i className="bi bi-book-half"></i>
            </div>
            <h2 className="auth-title">Đăng Nhập</h2>
            <p className="auth-subtitle">Chào mừng bạn trở lại thư viện!</p>
          </div>

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label">
                <i className="bi bi-envelope-fill me-2"></i>Email
              </Form.Label>
              <Form.Control
                className="auth-input"
                type="email"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="form-label">
                <i className="bi bi-lock-fill me-2"></i>Mật khẩu
              </Form.Label>
              <Form.Control
                className="auth-input"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button className="auth-button w-100" type="submit">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Đăng nhập
            </Button>

            <div className="auth-divider">
              <span>hoặc</span>
            </div>

            <Row>
              <Col xs={12} className="text-center mb-2">
                <div className="login-link">
                  Bạn chưa có tài khoản?{" "}
                  <Link to="/register" className="login-link-text">
                    Đăng ký ngay
                  </Link>
                </div>
              </Col>
              <Col xs={12} className="text-center">
                <div className="login-link">
                  <Link to="/forgot-password" className="login-link-text">
                    <i className="bi bi-question-circle me-1"></i>
                    Quên mật khẩu?
                  </Link>
                </div>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
