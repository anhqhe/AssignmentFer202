import axios from "axios";
import { useState } from "react";
import { Container, Form, FormSelect, InputGroup, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Dashboard.css";
import * as yup from "yup";

// Schema validation với Yup
const accountSchema = yup.object().shape({
  id: yup
    .string()
    .required("MSSV hoặc Staff ID là bắt buộc. Vui lòng nhập.")
    .trim()
    .min(3, "ID phải có ít nhất 3 ký tự")
    .matches(/^[a-zA-Z0-9]+$/, "ID chỉ được chứa chữ và số"),
  email: yup
    .string()
    .required("Email là bắt buộc. Vui lòng nhập.")
    .trim()
    .email("Email không hợp lệ")
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email không đúng định dạng"
    ),
  role: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .required("Vui lòng chọn loại tài khoản")
    .oneOf(["Student", "Librarian"], "Loại tài khoản không hợp lệ"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc. Vui lòng nhập.")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
      "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
    ),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
});

export default function CreateAccountByAdmin() {
  const [CPassword, setCpassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userAccount"));
  const [account, setAccount] = useState({
    id: "",
    role: "",
    username: "NewAccount",
    password: "",
    email: "",
    phone: null,
    avatar: "https://cdn-icons-png.flaticon.com/512/362/362003.png",
    status: "active",
    createdAt: new Date(),
  });

  // Kiểm tra quyền truy cập một lần khi load
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      alert("Bạn không có quyền truy cập trang này");
      navigate("/homepage");
    }
  }, [navigate, user]);

  const buildFormData = (override = {}) => {
    const base = {
      id: account.id?.trim(),
      email: account.email?.trim(),
      role: account.role,
      password: account.password,
      confirmPassword: CPassword,
    };
    return { ...base, ...override };
  };

  // Validate từng trường khi rời khỏi input (blur)
  const validateField = async (field, value) => {
    try {
      const data = buildFormData({ [field]: value });
      await accountSchema.validateAt(field, data);
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [field]: err.message }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});

    // Chuẩn bị dữ liệu để validate
    const dataToValidate = buildFormData();

    try {
      // Validate với Yup
      await accountSchema.validate(dataToValidate, { abortEarly: false });

      // Hash password
      const randomHashPass = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(account.password, randomHashPass);

      let newAccount = { ...account, password: hashPass };

      // Kiểm tra trùng lặp trong database
      const result = await axios.get("http://localhost:9999/users");
      const userList = result.data;
      const checkEmail = userList.find((e) => e.email === account.email);
      const checkId = userList.find((e) => e.id === account.id);

      if (checkEmail || checkId) {
        const dupErrors = {};
        if (checkEmail) dupErrors.email = "Email đã tồn tại trong hệ thống";
        if (checkId) dupErrors.id = "ID đã tồn tại trong hệ thống";
        setErrors(dupErrors);
        return;
      }

      // Tạo tài khoản mới
      const createResult = await axios.post(
        "http://localhost:9999/users",
        newAccount
      );
      if (createResult.data != null) {
        navigate("/admin/viewUsers");
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        // Ưu tiên hiển thị lỗi required nếu trường đang trống
        const priority = (type) => {
          switch (type) {
            case 'required': return 0;
            case 'min': return 1;
            case 'matches': return 2;
            case 'email': return 3;
            case 'oneOf': return 3;
            default: return 5;
          }
        };

        const sortedErrors = [...err.inner].sort((a, b) => priority(a.type) - priority(b.type));
        const validationErrors = {};
        sortedErrors.forEach((error) => {
          if (!validationErrors[error.path]) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      } else {
        console.error(err);
      }
    }
  };
  return (
    <Container className="create-account-box p-4" fluid>
      <h1 className="dashboard-title">Create Account</h1>
      <div className="mb-3 p-3" style={{ background: "#f8f9fc", border: "1px solid #e2e6ea", borderRadius: 12 }}>
        <div className="d-flex align-items-start" style={{ gap: 10 }}>
          <i className="bi bi-info-circle" style={{ color: "#5b6da4", fontSize: 18, marginTop: 2 }}></i>
          <div style={{ lineHeight: 1.55 }}>
            <div><strong>Yêu cầu nhập liệu:</strong> ID ≥ 3 ký tự (chữ/số), email đúng định dạng (có @ và tên miền), chọn role.</div>
            <div><strong>Mật khẩu:</strong> ≥ 6 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt; xác nhận phải trùng khớp.</div>
          </div>
        </div>
      </div>
      <Form onSubmit={handleCreate} className="create-account-form">
        <Form.Group className="mb-3">
          <Form.Label>MSSV hoặc Staff ID *</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-person-badge"></i>
            </InputGroup.Text>
            <Form.Control
              className="auth-input"
              type="text"
              placeholder="Nhập MSSV hoặc Staff ID..."
              onChange={(e) => setAccount({ ...account, id: e.target.value })}
              onBlur={(e) => validateField('id', e.target.value)}
              isInvalid={!!errors.id}
            />
            <Form.Control.Feedback type="invalid">
              {errors.id}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email *</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-envelope"></i>
            </InputGroup.Text>
            <Form.Control
              className="auth-input"
              type="email"
              placeholder="Nhập email..."
              onChange={(e) =>
                setAccount({ ...account, email: e.target.value })
              }
              onBlur={(e) => validateField('email', e.target.value)}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <Form.Label className="mb-0">Loại tài khoản *</Form.Label>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Chỉ chọn Student hoặc Librarian.</Tooltip>}
            >
              <i className="bi bi-info-circle" style={{ color: "#6c757d", cursor: "pointer" }}></i>
            </OverlayTrigger>
          </div>
          <InputGroup className="w-auto mt-1">
            <InputGroup.Text>
              <i className="bi bi-person-gear"></i>
            </InputGroup.Text>
            <FormSelect
              onChange={(e) => setAccount({ ...account, role: e.target.value })}
              onBlur={(e) => validateField('role', e.target.value)}
              isInvalid={!!errors.role}
            >
              <option value="">Select a role for account</option>
              <option value="Student">Student</option>
              <option value="Librarian">Librarian</option>
            </FormSelect>
            <Form.Control.Feedback type="invalid">
              {errors.role}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <Form.Label className="mb-0">Mật khẩu *</Form.Label>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Độ mạnh: ≥ 6 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.</Tooltip>}
            >
              <i className="bi bi-info-circle" style={{ color: "#6c757d", cursor: "pointer" }}></i>
            </OverlayTrigger>
          </div>
          <InputGroup className="mt-1">
            <InputGroup.Text>
              <i className="bi bi-lock"></i>
            </InputGroup.Text>
            <Form.Control
              className="auth-input"
              type="password"
              placeholder="Nhập mật khẩu..."
              onChange={(e) =>
                setAccount({ ...account, password: e.target.value })
              }
              onBlur={(e) => validateField('password', e.target.value)}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Xác nhận mật khẩu *</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-lock"></i>
            </InputGroup.Text>
            <Form.Control
              className="auth-input"
              type="password"
              placeholder="Nhập lại mật khẩu..."
              onChange={(e) => setCpassword(e.target.value)}
              onBlur={(e) => validateField('confirmPassword', e.target.value)}
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <div className="d-flex justify-content-start">
          <Button className="auth-button" type="submit">
            <i className="bi bi-person-plus me-2"></i>Tạo tài khoản
          </Button>
        </div>
      </Form>
    </Container>
  );
}
