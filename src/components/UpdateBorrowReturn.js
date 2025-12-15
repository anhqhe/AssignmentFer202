import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Alert,
  Table,
  Placeholder,
} from "react-bootstrap";

const RATE_PER_DAY = 5000;

export default function BorrowReturnPage() {
  const [mode, setMode] = useState("borrow");

  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);

  const [borrows, setBorrows] = useState([]);

  const [borrowForm, setBorrowForm] = useState({
    bookId: "",
    studentId: "",
    quantity: "",
    days: "",
  });

  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [fine, setFine] = useState(0);
  const [payment, setPayment] = useState(0);
  const [showModal, setShowModal] = useState(false);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:9999/books"),
      axios.get("http://localhost:9999/copies"),
      axios.get("http://localhost:9999/borrowHistory"),
    ]).then(([bk, cp, bh]) => {
      setBooks(bk.data);
      setCopies(cp.data);
      setBorrows(bh.data);
    });
  }, []);

  /* ================= BORROW ================= */

  const availableCount = (bookId) =>
    copies.filter(
      (c) => c.bookId === bookId && !c.isBorrowed && c.condition === "Good"
    ).length;

  const handleBorrow = async (e) => {
    e.preventDefault();
    const { bookId, studentId, quantity, days } = borrowForm;
    if (!bookId || !studentId || quantity === "" || days === "") {
      alert("Please fill in all fields");
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (availableCount(bookId) < quantity) {
      alert("Not enough copies available");
      return;
    }

    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + Number(days));

    const freeCopies = copies
      .filter(
        (c) => c.bookId === bookId && !c.isBorrowed && c.condition === "Good"
      )
      .slice(0, quantity);

    for (const copy of freeCopies) {
      const record = {
        id: String(Date.now() + Math.random()),
        studentId,
        copyId: copy.id,
        borrowDate: today.toISOString().slice(0, 10),
        dueDate: due.toISOString().slice(0, 10),
        returnDate: null,
      };

      await axios.post("http://localhost:9999/borrowHistory", record);
      await axios.patch(`http://localhost:9999/copies/${copy.id}`, {
        isBorrowed: true,
      });
    }

    alert("Borrow successful");
    window.location.reload();
  };

  /* ================= RETURN ================= */

  const activeBorrows = borrows.filter((b) => !b.returnDate);

  const lateDays = (due) =>
    Math.max(0, Math.ceil((new Date() - new Date(due)) / 86400000));

  const calcFine = (due) => lateDays(due) * RATE_PER_DAY;

  const openReturnModal = (borrow) => {
    const calculatedFine = calcFine(borrow.dueDate);
    setSelectedBorrow(borrow);
    setPayment();
    setFine(calculatedFine);
    setShowModal(true);
  };

  const confirmReturn = async () => {
    const fine = calcFine(selectedBorrow.dueDate);

    if (payment > fine) {
      alert("Paid amount cannot exceed the fine");
      return;
    }

    let status = "none";
    if (fine > 0) {
      status = payment >= fine ? "paid" : "unpaid";
    }

    // update borrowHistory
    await axios.patch(
      `http://localhost:9999/borrowHistory/${selectedBorrow.id}`,
      { returnDate: new Date().toISOString().slice(0, 10) }
    );

    // update copy
    await axios.patch(`http://localhost:9999/copies/${selectedBorrow.copyId}`, {
      isBorrowed: false,
    });

    // create fee record
    await axios.post("http://localhost:9999/fees", {
      id: String(Date.now()),
      borrowHistoryId: selectedBorrow.id,
      studentId: selectedBorrow.studentId,
      amount: fine,
      status,
      reason: fine > 0 ? "overdue" : "on time",
    });

    setShowModal(false);
    window.location.reload();
  };

  return (
    <div style={{ margin: "20px" }}>
      <h4>Borrow / Return Management</h4>

      <ButtonGroup className="mb-4">
        <Button
          variant={mode === "borrow" ? "primary" : "outline-primary"}
          onClick={() => setMode("borrow")}
        >
          Borrow
        </Button>
        <Button
          variant={mode === "return" ? "success" : "outline-success"}
          onClick={() => setMode("return")}
        >
          Return
        </Button>
      </ButtonGroup>

      {/* ================= BORROW UI ================= */}
      {mode === "borrow" && (
        <Card className="p-4">
          <h5>Borrow Books</h5>
          <p className="text-muted">Maximum borrowing days: 30</p>

          <Form onSubmit={handleBorrow}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>Book</Form.Label>
                <Form.Select
                  onChange={(e) =>
                    setBorrowForm({ ...borrowForm, bookId: e.target.value })
                  }
                  style={{ padding: 0, height: "38px", padding: "6px 12px" }}
                >
                  <option value="">Select</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({availableCount(b.id)} available)
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Label>Student ID</Form.Label>
                <Form.Control
                  onChange={(e) =>
                    setBorrowForm({
                      ...borrowForm,
                      studentId: e.target.value,
                    })
                  }
                />
              </Col>

              <Col md={2}>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={borrowForm.quantity}
                  onChange={(e) =>
                    setBorrowForm({
                      ...borrowForm,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </Col>

              <Col md={2}>
                <Form.Label>Days</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={30}
                  placeholder="Max 30"
                  value={borrowForm.days}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setBorrowForm({ ...borrowForm, days: "" });
                      return;
                    }

                    const num = Number(value);
                    if (num > 30) return;

                    setBorrowForm({ ...borrowForm, days: num });
                  }}
                />
              </Col>

              <Col md={1} className="d-flex align-items-end">
                <Button type="submit">Borrow</Button>
              </Col>
            </Row>
          </Form>
        </Card>
      )}

      {/* ================= RETURN UI ================= */}
      {mode === "return" && (
        <Card className="p-3">
          <h5>Return Books</h5>
          <p className="text-muted">Late fee: 5000 VND / day</p>

          <Table striped bordered>
            <thead>
              <tr>
                <th>Student</th>
                <th>Copy</th>
                <th>Copy Name</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Days Late</th>
                <th>Fine</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeBorrows.map((b) => (
                <tr key={b.id}>
                  <td>{b.studentId}</td>
                  <td>{b.copyId}</td>
                  <td>
                    {(() => {
                      const copy = copies.find((c) => c.id === b.copyId);
                      const book = copy
                        ? books.find((x) => x.id === copy.bookId)
                        : null;
                      return book ? `${book.title} (${b.copyId})` : b.copyId;
                    })()}
                  </td>
                  <td>{b.borrowDate}</td>
                  <td>{b.dueDate}</td>
                  <td>{lateDays(b.dueDate)}</td>
                  <td className="text-danger">
                    {calcFine(b.dueDate).toLocaleString()} VND
                  </td>
                  <td className="d-flex gap-2">
                    <Button size="sm" variant="secondary">
                      Send Mail
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => openReturnModal(b)}
                    >
                      Return
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* ================= PAYMENT MODAL ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Return Confirmation</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {fine > 0 && (
            <p>
              <b>Fine:</b> {fine.toLocaleString()} VND
              <br />
              <small className="text-muted">Late fee: 5,000 VND/day</small>
            </p>
          )}

          <Form.Group className="mb-2">
            <Form.Label>Payment amount</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={payment}
              onChange={(e) => setPayment(Number(e.target.value))}
              placeholder="Enter amount paid"
            />
          </Form.Group>

          {payment < fine && payment > 0 && (
            <Alert variant="warning">
              Student has unpaid debt: {(fine - payment).toLocaleString()} VND
            </Alert>
          )}

          {payment === 0 && fine > 0 && (
            <Alert variant="danger">
              No payment made. Full debt will be recorded.
            </Alert>
          )}

          {payment > fine && (
            <Alert variant="danger">Paid amount exceeds required fine.</Alert>
          )}

          {payment === fine && fine > 0 && (
            <Alert variant="success">Fine paid in full.</Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            disabled={payment > fine}
            onClick={confirmReturn}
          >
            Confirm Return
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
