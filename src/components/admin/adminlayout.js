import { Col, Container, Row } from "react-bootstrap";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
    // const user = JSON.parse(localStorage.getItem("userAccount"))
    // const navigate = useNavigate()
    // if (!user || user.role !== 'Admin') {
    //     alert("Bạn không có quyền truy cập trang này")
    //     navigate('/homepage')
    // }
    return (
        <Container fluid>
            <Row>
                <Col xs={2}>
                    <Sidebar></Sidebar>
                </Col>
                <Col xs={10}>
                    <Outlet />
                </Col>
            </Row>
        </Container>
    )
}