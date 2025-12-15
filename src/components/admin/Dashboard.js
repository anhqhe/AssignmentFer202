import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [totalAcc, setTotalAcc] = useState(0);
  const [totalAccActive, setTotalAccActive] = useState(0);
  const [totalAccInactive, setTotalAccInactive] = useState(0);
  const [acc, setAcc] = useState([]);
  const user = JSON.parse(localStorage.getItem("userAccount"));
  if (!user || user.role !== "Admin") {
    alert("Bạn không có quyền truy cập trang này");
    navigate("/homepage");
  }
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://localhost:9999/users?_sort=createdAt&_order=desc&_limit=5")
      .then((result) => setAcc(result.data))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    axios
      .get("http://localhost:9999/users")
      .then((result) => {
        const userList = result.data;
        setTotalAcc(userList.length);
        const userAcive = userList.filter((u) => u.status === "active");
        setTotalAccActive(userAcive.length);

        const userInactive = userList.filter((u) => u.status === "inactive");
        setTotalAccInactive(userInactive.length);
      })
      .catch((err) => console.error(err));
  }, [acc]);

  const handleLock = (id) => {
    let setingUser = acc.find((u) => u.id === id);
    setingUser.status == "active"
      ? (setingUser = { ...setingUser, status: "inactive" })
      : (setingUser = { ...setingUser, status: "active" });
    axios
      .patch(`http://localhost:9999/users/${id}`, setingUser)
      .then((res) => {
        alert("Change successfuly");
        navigate("/admin/viewUsers");
      })
      .catch((err) => console.error(err));
    let newUserView = acc.filter((u) => u.id != id);
    setAcc([...newUserView, setingUser]);
  };

  return (
    <div className="dashboard-box p-4">
      <Row className="stats-row">
        <h3 className="dashboard-title">Tổng quan hệ thống</h3>

        <Col md={4} className="mb-4">
          <div className="stat-card primary">
            <div className="stat-title">
              <i className="bi bi-people-fill"></i>
              Tổng số tài khoản
            </div>
            <div className="stat-value">{totalAcc}</div>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="stat-card success">
            <div className="stat-title">
              <i className="bi bi-person-check-fill"></i>
              Tài khoản đang hoạt động
            </div>
            <div className="stat-value">{totalAccActive}</div>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="stat-card danger">
            <div className="stat-title">
              <i className="bi bi-person-x-fill"></i>
              Tài khoản bị khóa
            </div>
            <div className="stat-value">{totalAccInactive}</div>
          </div>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col className="recent-accounts-header">
          Danh sách tài khoản gần đây
          <Link to="/admin/viewUsers" className="view-all-link">
            Xem tất cả <i className="bi bi-arrow-right"></i>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="accounts-table-container">
            <Table className="accounts-table">
              <thead>
                <tr style={{ backgroundColor: "black" }}>
                  <th>Người dùng</th>
                  <th>Loại tài khoản</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {acc?.map((a, i) => (
                  <tr key={i}>
                    <td>{a.email}</td>
                    <td>{a.role}</td>
                    <td>
                      {new Date(a.createdAt).toLocaleTimeString()}{" "}
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {a.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </td>
                    <td className="action-table-button">
                      <Link
                        to={`/profile/id/${a.id}/isAuthor/${false}`}
                        className="action-link"
                      >
                        <i className="bi bi-eye"></i> Xem
                      </Link>
                      <button
                        className={`action-link ban-button ${
                          a.status === "inactive" ? "unban-button" : ""
                        }`}
                        onClick={() => handleLock(a.id)}
                      >
                        <i
                          className={`bi ${
                            a.status === "inactive" ? "bi-unlock" : "bi-ban"
                          }`}
                        ></i>
                        {a.status === "inactive" ? "Mở khóa" : "Khóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </div>
  );
}
