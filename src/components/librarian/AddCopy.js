import axios from "axios";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Table,
  Form,
  InputGroup,
  Container,
  Image,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AddCopy() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [count, setCount] = useState(1);
  const [search, setSearch] = useState("");
  const [matchingBooks, setMatchingBooks] = useState([]);
  const [newCopies, setNewCopies] = useState([]);
  const [copies, setCopies] = useState([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookRes = await axios.get("http://localhost:9999/books");
        setBooks(bookRes.data);
        setMatchingBooks(bookRes.data);

        const book = searchParams.get("book");
        if (book) {
          setSelectedBook(bookRes.data.find((b) => b.id === book));
        }

        const copyRes = await axios.get("http://localhost:9999/copies");
        setCopies(copyRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filter = books.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.toLowerCase().includes(search.toLowerCase()) ||
        b.olid.toLowerCase().includes(search.toLowerCase())
    );
    setMatchingBooks(filter);
  }, [search, books]);

  useEffect(() => {
    if (count && count < 1) setCount(1);
  }, [count]);

  const createCopies = () => {
    if (!count) {
      alert("Please enter number of copies.");
      return;
    }
    if (!selectedBook) {
      alert("Please select a book.");
      return;
    }

    if (count >= 30 && !window.confirm("Create many copies?")) return;

    const copy = {
      bookId: selectedBook.id,
      condition: "Good",
      isBorrowed: false,
      createTime: Date.now(),
    };

    for (let i = 0; i < count; i++) {
      axios
        .post("http://localhost:9999/copies", copy)
        .then((res) => setNewCopies((prev) => [...prev, res.data]));
    }
    alert(`${count} copies created.`);
  };

  const changeCondition = (id, value) => {
    const update = { ...copies.find((c) => c.id === id), condition: value };
    axios.put(`http://localhost:9999/copies/${id}`, update);
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h3>eFPT Library – Add New Copies</h3>
        </Col>
        <Col className="text-end">
          <Button
            variant="secondary"
            onClick={() => navigate("/librarian/copy_list")}
          >
            Back
          </Button>
        </Col>
      </Row>

      {/* Actions */}
      <Row className="mb-4">
        <Col className="text-end">
          <Button
            variant="outline-danger"
            className="me-2"
            onClick={() => navigate("/librarian/copy_list")}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={createCopies}>
            Add Copy
          </Button>
        </Col>
      </Row>

      {/* Search & Count */}
      <Row className="mb-4 g-3">
        <Col lg={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search by title, ISBN, OLID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col lg={6}>
          <InputGroup>
            <InputGroup.Text>#</InputGroup.Text>
            <Form.Control
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              placeholder="Number of copies"
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Book list + detail */}
      <Row>
        <Col md={6}>
          <Table bordered hover>
            <tbody>
              {matchingBooks.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Button
                      variant={selectedBook?.id === b.id ? "primary" : "light"}
                      className="w-100 text-start"
                      onClick={() => {
                        setSelectedBook(b);
                        setNewCopies([]);
                      }}
                    >
                      <strong>{b.id}</strong> – {b.title} (ISBN:{" "}
                      {b.isbn || "null"}, OLID: {b.olid || "null"})
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>

        <Col md={6} className="text-center">
          {selectedBook ? (
            <>
              <Image src={selectedBook.image} fluid className="mb-3" />
              <h5>{selectedBook.title}</h5>
              <p>{selectedBook.author}</p>
            </>
          ) : (
            <p>Please select a book</p>
          )}
        </Col>
      </Row>

      {/* Generated Copies */}
      {newCopies.length > 0 && (
        <>
          <h4 className="mt-4">Copies Generated</h4>
          <Table striped hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {newCopies.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <Form.Select
                      value={c.condition}
                      onChange={(e) => changeCondition(c.id, e.target.value)}
                    >
                      <option value="Good">Good</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Lost">Lost</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}
