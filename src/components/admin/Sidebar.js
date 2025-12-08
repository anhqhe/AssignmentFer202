import { Col, Nav, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import './Sidebar.css'
import { useEffect } from "react";

export default function Sidebar() {
    const navigate = useNavigate()
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userAccount'));
        if (!userData || userData.role !== 'Admin') {
            navigate('/homepage');
        }
    }, [navigate]);
    const handelLogout = (e) => {
        e.preventDefault()

        localStorage.removeItem("userAccount")
        alert("Đăng xuất thành công")
        navigate('/login')
    }

    return (
        <Row>
            <Col className="sidebar-container">
                <div className="sidebar-header">
                    <h5 className="mt-4">Admin Panel</h5>
                    <p>Quản lý hệ thống Library Portal</p>
                </div>

                <Nav className="flex-column sidebar-nav">
                    <p>ĐIỀU HƯỚNG</p>
                    <Nav.Link as={Link} to="/admin/dashboard">
                        <i className="bi bi-speedometer2"></i>
                        <span>Tổng quan</span>
                    </Nav.Link>
                    <p>QUẢN LÝ TÀI KHOẢN</p>
                    <Nav.Link as={Link} to="/admin/viewUsers">
                        <i className="bi bi-people"></i>
                        <span>Tất cả tài khoản</span>
                    </Nav.Link>
                    <p>THAO TÁC</p>
                    <Nav.Link as={Link} to="/admin/create">
                        <i className="bi bi-person-plus"></i>
                        <span>Tạo tài khoản mới</span>
                    </Nav.Link>
                    <Nav.Link onClick={handelLogout} className="logout">
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Đăng xuất</span></Nav.Link>
                </Nav>
            </Col>
        </Row>
    )
}