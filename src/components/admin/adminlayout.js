import { Col, Container, Row } from "react-bootstrap";
import Sidebar from "./Sidebar";
import { Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  
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