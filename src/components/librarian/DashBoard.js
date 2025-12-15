import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../styles/LibrarianDashboard.css";

export default function LibrarianDashboard() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    (async () => {
      try {
        const [bk, cp, bh, fe] = await Promise.all([
          axios.get("http://localhost:9999/books"),
          axios.get("http://localhost:9999/copies"),
          axios.get("http://localhost:9999/borrowHistory"),
          axios.get("http://localhost:9999/fees"),
        ]);
        setBooks(bk.data || []);
        setCopies(cp.data || []);
        setBorrows(bh.data || []);
        setFees(fe.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /* ===== Statistics ===== */
  const totalCopies = copies.length;
  const borrowedCopies = copies.filter((c) => c.isBorrowed).length;
  const availableCopies = totalCopies - borrowedCopies;

  const activeBorrows = borrows.filter((b) => !b.returnDate);
  const overdueBorrows = activeBorrows.filter(
    (b) => new Date(b.dueDate) < new Date()
  );

  const borrowedToday = borrows.filter((b) => b.borrowDate === today).length;
  const returnedToday = borrows.filter((b) => b.returnDate === today).length;

  const damaged = copies.filter((c) => c.condition === "Damaged").length;
  const lost = copies.filter((c) => c.condition === "Lost").length;

  const unpaidFees = fees.filter((f) => f.status === "unpaid");
  const totalDebt = unpaidFees.reduce((sum, f) => sum + f.amount, 0);

  const borrowRate =
    totalCopies === 0 ? 0 : Math.round((borrowedCopies / totalCopies) * 100);

  return (
    <div className=" p-4">
      {/* ===== Header ===== */}
      <div className="mb-4">
        <h3>📚 Librarian Dashboard</h3>
      </div>

      {/* ===== Overview Cards ===== */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h6>Total Books</h6>
              <h2>{books.length}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h6>Total Copies</h6>
              <h2>{totalCopies}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm h-100 border-warning">
            <Card.Body>
              <h6>Borrowed</h6>
              <h2 className="text-warning">{borrowedCopies}</h2>
              
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm h-100 border-success">
            <Card.Body>
              <h6>Available</h6>
              <h2 className="text-success">{availableCopies}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Daily Activity ===== */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h6>Borrowed Today</h6>
              <h3>{borrowedToday}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h6>Returned Today</h6>
              <h3>{returnedToday}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100 border-danger">
            <Card.Body>
              <h6>Overdue Borrows</h6>
              <h3 className="text-danger">{overdueBorrows.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Overdue & Finance ===== */}
      <Row className="g-4 mb-4">
        <Col md={7}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5>⏰ Overdue Borrow Records</h5>

              {overdueBorrows.length === 0 ? (
                <p className="text-muted mt-3">No overdue records</p>
              ) : (
                <Table hover responsive size="sm" className="mt-3">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Copy</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueBorrows.slice(0, 6).map((b) => (
                      <tr key={b.id}>
                        <td>{b.studentId}</td>
                        <td>{b.copyId}</td>
                        <td>{b.dueDate}</td>
                        <td>
                          <Badge bg="danger">Overdue</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {overdueBorrows.length > 0 && (
                <div
                  className="text-primary mt-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/librarian/return")}
                >
                  View all overdue →
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow-sm h-100 border-warning">
            <Card.Body>
              <h5>💰 Financial Overview</h5>

              <p className="mt-3 mb-1 fw-semibold">Total Unpaid Debt</p>
              <h4 className="text-danger">{totalDebt.toLocaleString()} VND</h4>

              <p className="mt-3">
                Students with debt:{" "}
                <b>{new Set(unpaidFees.map((f) => f.studentId)).size}</b>
              </p>

              <hr />
              <small className="text-muted">
                Late return fee: 5,000 VND / day
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Copy Condition ===== */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>📦 Copy Condition Summary</h5>

              <Row className="g-3 mt-3">
                <Col md={4}>
                  <Badge bg="success" className="p-3 w-100 text-center">
                    Good Copies: {totalCopies - damaged - lost}
                  </Badge>
                </Col>
                <Col md={4}>
                  <Badge bg="warning" className="p-3 w-100 text-center">
                    Damaged Copies: {damaged}
                  </Badge>
                </Col>
                <Col md={4}>
                  <Badge bg="danger" className="p-3 w-100 text-center">
                    Lost Copies: {lost}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
