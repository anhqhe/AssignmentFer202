import { Col, Container, Row, Form, Button, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import "./Auth.css";

export default function Register() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Cpassword, setCpassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (!password.trim() || !Cpassword.trim()) {
      alert("Bạn cần điền đủ thông tin");
      return;
    }
    if (password !== Cpassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    const checkPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!checkPass.test(password)) {
      alert(
        "Mật khẩu phải có chữ hoa, chữ thường, số, ký tự đặc biệt và độ dài trên 6 ký tự"
      );
      return;
    }

    const randomHashPass = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, randomHashPass);

    axios
      .get("http://localhost:9999/users")
      .then((result) => {
        const userList = result.data;
        const checkEmail = userList.find((e) => e.email === email);
        const checkId = userList.find((e) => e.id === id);
        if (checkEmail) {
          alert("Email đã tồn tại trong hệ thống");
          return;
        }
        if (checkId) {
          alert("ID đã tồn tại trong hệ thống");
          return;
        }

        const newUser = {
          id: id,
          role: "Student",
          username: id.toLowerCase(),
          email: email,
          password: hashPass,
          avatar: "https://cdn-icons-png.flaticon.com/512/362/362003.png",
          phone: null,
          status: "active",
          createdAt: new Date(),
        };

        axios
          .post("http://localhost:9999/users", newUser)
          .then((result) => {
            if (result.data != null) {
              const user = result.data;
              localStorage.setItem("userAccount", JSON.stringify(user));
              alert("Register success");
              navigate("/login");
            } else {
              alert("Register false");
            }
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  return (
    <Container className="register-container" fluid>
      <Row
        className="justify-content-center align-items-center"
        style={{ minHeight: "100vh", position: "relative", zIndex: 10 }}
      >
        <Col md={8} lg={6} xl={5} className="px-4">
          <div className="auth-container">
            <div className="text-center mb-4">
              {/* Icon */}
              <div className="auth-icon">
                <i className="bi bi-person-plus-fill"></i>
              </div>
              <h2 className="auth-title">Đăng Ký Tài Khoản</h2>
              <p className="auth-subtitle">
                Tham gia thư viện đọc sách ngay hôm nay
              </p>
            </div>

            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label">
                  <i className="bi bi-person-badge-fill me-2"></i>MSSV hoặc
                  Staff ID
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="text"
                  placeholder="Nhập MSSV hoặc Staff ID..."
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
              </Form.Group>

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

              <Form.Group className="mb-3">
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

              <Form.Group className="mb-4">
                <Form.Label className="form-label">
                  <i className="bi bi-shield-lock-fill me-2"></i>Xác nhận mật
                  khẩu
                </Form.Label>
                <Form.Control
                  className="auth-input"
                  type="password"
                  placeholder="Nhập lại mật khẩu..."
                  value={Cpassword}
                  onChange={(e) => setCpassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button className="auth-button w-100" type="submit">
                <i className="bi bi-person-plus me-2"></i>Tạo tài khoản
              </Button>

              <div className="auth-divider">
                <span>hoặc</span>
              </div>

              <div className="text-center login-link">
                Đã có tài khoản?{" "}
                <Link to="/login" className="login-link-text">
                  Đăng nhập ngay
                </Link>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
