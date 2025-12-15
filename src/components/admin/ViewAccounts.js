import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import bcrypt from "bcryptjs";
import { Container, Form, FormSelect, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ViewAccounts() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusSort, setStatusSort] = useState("none");
  const [userView, setUserView] = useState([]);
  const user = JSON.parse(localStorage.getItem("userAccount"));
  const navigate = useNavigate();

  // Kiểm tra quyền truy cập Admin
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      alert("Bạn không có quyền truy cập trang này");
      navigate("/homepage");
    }
  }, [user, navigate]);

  // Fetch danh sách tài khoản
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:9999/users");
        setUsers(res.data);
        setUserView(res.data);
      } catch (err) {
        console.error("Lỗi fetch danh sách tài khoản:", err);
        alert("Lỗi tải danh sách tài khoản. Vui lòng thử lại!");
      }
    };
    fetchUsers();
  }, []);

  // Khóa/Mở khóa tài khoản
  const handleLock = async (id) => {
    // Chặn khóa tài khoản Admin
    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.role === "Admin") {
      alert("Không thể khóa tài khoản Admin!");
      return;
    }

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn thay đổi trạng thái tài khoản này?"
      )
    ) {
      return;
    }

    try {
      // Tạo đối tượng user mới với status đảo ngược
      const updatedUser = {
        ...targetUser,
        status: targetUser.status === "active" ? "inactive" : "active",
      };

      // PATCH lên server
      await axios.patch(`http://localhost:9999/users/${id}`, updatedUser);

      // Cập nhật state users và userView
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === id ? updatedUser : u))
      );

      alert(
        `${
          updatedUser.status === "active" ? "Mở khóa" : "Khóa"
        } tài khoản thành công!`
      );
    } catch (err) {
      console.error("Lỗi thay đổi trạng thái:", err);
      alert("Lỗi thay đổi trạng thái tài khoản. Vui lòng thử lại!");
    }
  };

  // Reset mật khẩu
  const handleResetPass = async (e, targetUser) => {
    e.preventDefault();

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn reset mật khẩu cho tài khoản ${targetUser.email}?`
      )
    ) {
      return;
    }

    try {
      const defaultPass = "user@123";
      const randomHashPass = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(defaultPass, randomHashPass);

      // PATCH lên server
      await axios.patch(`http://localhost:9999/users/${targetUser.id}`, {
        ...targetUser,
        password: hashPass,
      });

      // Cập nhật state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === targetUser.id ? { ...u, password: hashPass } : u
        )
      );

      alert(
        `Reset mật khẩu thành công!\n\nThông tin:\nEmail: ${targetUser.email}\nMật khẩu mới: ${defaultPass}\n\nVui lòng thông báo cho người dùng để đăng nhập lại.`
      );
    } catch (err) {
      console.error("Lỗi reset mật khẩu:", err);
      alert("Lỗi reset mật khẩu. Vui lòng thử lại!");
    }
  };

  // Lọc và sắp xếp dữ liệu
  useEffect(() => {
    let filtered = [...users];

    // Tìm kiếm theo tên, ID hoặc email
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo role
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Sắp xếp theo trạng thái
    if (statusSort !== "none") {
      filtered = filtered.sort((a, b) => {
        return statusSort === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      });
    }

    setUserView(filtered);
  }, [searchTerm, roleFilter, statusSort, users]);

  return (
    <Container className="user-table-container" fluid>
      <h2 className="dashboard-title">Danh sách người dùng</h2>

      <Form className="filters">
        <Form.Control
          type="text"
          placeholder="Tìm theo tên, ID hoặc Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormSelect
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả role</option>
          <option value="Admin">Admin</option>
          <option value="Librarian">Librarian</option>
          <option value="Student">Student</option>
        </FormSelect>
        <FormSelect
          value={statusSort}
          onChange={(e) => setStatusSort(e.target.value)}
        >
          <option value="none">Không sắp xếp</option>
          <option value="asc">Sắp xếp trạng thái ↑</option>
          <option value="desc">Sắp xếp trạng thái ↓</option>
        </FormSelect>
      </Form>

      <Table hover className="user-table">
        <thead>
          <tr>
            <th>NGƯỜI DÙNG</th>
            <th>ID</th>
            <th>Email</th>
            <th>LOẠI TÀI KHOẢN</th>
            <th>NGÀY ĐĂNG KÝ</th>
            <th>TRẠNG THÁI</th>
            <th>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {userView?.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="user-info">
                  <img
                    src={u.avatar}
                    alt={u.username}
                    className="user-avatar"
                  />
                  <span className="user-name">{u.username}</span>
                </div>
              </td>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
              <td>
                {u.role === "Admin" ? (
                  <>
                    <i
                      className="bi bi-circle-fill"
                      style={{
                        color: "green",
                        fontSize: "10px",
                        marginRight: "5px",
                      }}
                    ></i>
                    Hoạt động
                  </>
                ) : u.status === "active" ? (
                  <>
                    <i
                      className="bi bi-circle-fill"
                      style={{
                        color: "green",
                        fontSize: "10px",
                        marginRight: "5px",
                      }}
                    ></i>
                    Hoạt động
                  </>
                ) : (
                  <>
                    <i
                      className="bi bi-circle-fill"
                      style={{
                        color: "red",
                        fontSize: "10px",
                        marginRight: "5px",
                      }}
                    ></i>
                    Bị khóa
                  </>
                )}
              </td>

              <td className="actions">
                <button
                  className="view-btn"
                  onClick={() =>
                    navigate(`/profile/id/${u.id}/isAuthor/${false}`)
                  }
                >
                  <i className="bi bi-eye"></i> Xem
                </button>

                {u.role !== "Admin" && (
                  <button
                    className={`action-link ban-button ${
                      u.status === "inactive" ? "unban-button" : ""
                    }`}
                    onClick={() => handleLock(u.id)}
                  >
                    <i
                      className={`bi ${
                        u.status === "inactive" ? "bi-unlock" : "bi-ban"
                      }`}
                    ></i>
                    {u.status === "active" ? "Khóa" : "Mở khóa"}
                  </button>
                )}

                <button
                  className="action-link reset-pasword-btn"
                  onClick={(e) => handleResetPass(e, u)}
                >
                  <i className="bi bi-arrow-repeat"></i>
                  Reset Password
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
