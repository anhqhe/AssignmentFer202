import axios from "axios";
import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Form,
  Row,
  Col,
  Container,
  InputGroup,
  Badge,
} from "react-bootstrap";
import Pagination from "../Pagination";
import { useNavigate } from "react-router-dom";

export default function CopyList() {
  const [copies, setCopies] = useState([]);
  const [disCopies, setDisCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("all");
  const [status, setStatus] = useState("all");
  const [totalPages, setTotalPages] = useState(0);
  const [currPage, setCurrPage] = useState(1);
  const [refresh, setRefresh] = useState(true);

  const limit = 12;
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:9999/copies").then((res) => {
      const sorted = res.data.sort((a, b) => b.createTime - a.createTime);
      setCopies(sorted);
    });

    axios.get("http://localhost:9999/books").then((res) => setBooks(res.data));
  }, [refresh]);

  useEffect(() => {
    let filter = [...copies];

    if (search.trim()) {
      const t = search.toLowerCase().trim();
      filter = filter.filter(
        (c) =>
          (getTitle(c.bookId) || "").toLowerCase().includes(t) ||
          c.id.toLowerCase().startsWith(t) ||
          (getISBN(c.bookId) || "").toLowerCase().startsWith(t) ||
          (getOLID(c.bookId) || "").toLowerCase().startsWith(t)
      );
    }

    if (condition !== "all") {
      filter = filter.filter((c) => c.condition === condition);
    }

    if (status !== "all") {
      filter = filter.filter((c) => c.isBorrowed === (status === "true"));
    }

    const pages = Math.ceil(filter.length / limit);
    setTotalPages(pages);

    if (currPage > pages && pages > 0) setCurrPage(1);

    const start = (currPage - 1) * limit;
    setDisCopies(filter.slice(start, start + limit));
  }, [search, condition, status, copies, books, currPage]);

  const getTitle = (id) => books.find((b) => b.id === id)?.title;
  const getISBN = (id) => books.find((b) => b.id === id)?.isbn;
  const getOLID = (id) => books.find((b) => b.id === id)?.olid;

  const changeCondition = (id, value) => {
    const update = { ...copies.find((c) => c.id === id), condition: value };
    axios.put(`http://localhost:9999/copies/${id}`, update).then(() => {
      alert("Updated successfully");
      setRefresh((p) => !p);
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this copy?")) return;
    axios.delete(`http://localhost:9999/copies/${id}`).then(() => {
      setRefresh((p) => !p);
    });
  };

  return (
    <Container fluid className="py-4">
      {/* Search & Filter */}
      <Row className="mb-4 g-3 align-items-end">
        <Col lg={4}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search by title, ID, ISBN"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col lg={4}>
          <Form.Select onChange={(e) => setCondition(e.target.value)}>
            <option value="all">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Damaged">Damaged</option>
            <option value="Lost">Lost</option>
          </Form.Select>
        </Col>

        <Col lg={4}>
          <Form.Select onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="false">Available</option>
            <option value="true">Borrowed</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Add button */}
      <div className="mb-3 text-end">
        <Button
          variant="success"
          onClick={() => navigate("/librarian/copy/add")}
        >
          ➕ Add New Copies
        </Button>
      </div>

      {/* Table */}
      <Table striped hover responsive>
        <thead className="table-dark">
          <tr>
            <th style={{ color: "#fff" }}>ID</th>
            <th style={{ color: "#fff" }}>Title</th>
            <th style={{ color: "#fff" }}>Condition</th>
            <th style={{ color: "#fff" }}>Status</th>
            <th style={{ color: "#fff" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {disCopies.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{getTitle(c.bookId)}</td>
              <td>
                <Badge
                  bg={
                    c.condition === "Good"
                      ? "success"
                      : c.condition === "Damaged"
                      ? "warning"
                      : "danger"
                  }
                >
                  {c.condition}
                </Badge>
              </td>
              <td>
                <Badge bg={c.isBorrowed ? "secondary" : "primary"}>
                  {c.isBorrowed ? "Borrowed" : "Available"}
                </Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Form.Select
                    size="sm"
                    value={c.condition}
                    onChange={(e) => changeCondition(c.id, e.target.value)}
                  >
                    <option value="Good">Good</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                  </Form.Select>

                  <Button
                    size="sm"
                    variant="danger"
                    disabled={c.isBorrowed && c.condition !== "Lost"}
                    onClick={() => handleDelete(c.id)}
                  >
                    🗑
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currPage={currPage}
        setCurrPage={setCurrPage}
      />
    </Container>
  );
}
