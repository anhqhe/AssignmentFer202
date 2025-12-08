import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container } from "react-bootstrap";

export default function BorrowHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const userAccount = JSON.parse(localStorage.getItem("userAccount") || "null");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [borrowRes, copyRes, bookRes, userRes] = await Promise.all([
          axios.get("http://localhost:9999/borrowHistory?_limit=1000"),
          axios.get("http://localhost:9999/copies?_limit=1000"),
          axios.get("http://localhost:9999/books?_limit=1000"),
          axios.get("http://localhost:9999/users?_limit=1000")
        ]);

        let borrowList = borrowRes.data || [];
        const copies = copyRes.data || [];
        const books = bookRes.data || [];
        const users = userRes.data || [];

        if (userAccount?.role === "Student") {
          borrowList = borrowList.filter(b => b.studentId === userAccount.id);
        }

        const joined = borrowList.map(b => {
          const copy = copies.find(c => c.id === b.copyId);
          const book = copy ? books.find(x => x.id === copy.bookId) : null;
          const user = users.find(u => u.id === b.studentId);

          let daysLate = 0;
          const due = new Date(b.dueDate);

          if (b.returnDate) {
            const ret = new Date(b.returnDate);
            daysLate = Math.max(
              0,
              Math.ceil((ret - due) / (1000 * 60 * 60 * 24))
            );
          } else if (new Date() > due) {
            daysLate = Math.max(
              0,
              Math.ceil((new Date() - due) / (1000 * 60 * 60 * 24))
            );
          }

          return { ...b, copy, book, user, daysLate };
        });

        joined.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

        setRecords(joined);
      } catch (err) {
        console.error("Lỗi load borrow history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRecords = records.filter(r => {

    if (statusFilter === "returned" && !r.returnDate) return false;
    if (statusFilter === "borrowing" && (r.returnDate || new Date(r.dueDate) < new Date())) return false;
    if (statusFilter === "overdue" && (r.returnDate || new Date(r.dueDate) >= new Date())) return false;

    const borrowDate = new Date(r.borrowDate);
    if (startDate && borrowDate < new Date(startDate)) return false;
    if (endDate && borrowDate > new Date(endDate)) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const currentPageData = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <Container>
      <h4>Borrow History</h4>

      <div className="mb-3 d-flex flex-wrap gap-3">
        <div>
          <label className="me-2">Filter by status:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="borrowing">Borrowing</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div>
          <label className="me-2">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{
              border: "1px solid grey",
              borderRadius: "2px",
              marginTop: "2%"
            }}
          />
        </div>

        <div>
          <label className="me-2">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            style={{
              border: "1px solid grey",
              borderRadius: "2px",
              marginTop: "2%"
            }}
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredRecords.length === 0 ? (
        <div>No borrow records found.</div>
      ) : (
        <>
          <div className="table-responsive mt-2">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Student</th>
                  <th>Book ID</th>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Days Late</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={
                      r.returnDate
                        ? ""
                        : new Date(r.dueDate) < new Date()
                          ? "table-danger"
                          : ""
                    }
                  >
                    <td>{(page - 1) * pageSize + idx + 1}</td>
                    <td>{r.user?.username || r.user?.email || r.studentId}</td>
                    <td>{r.copyId}</td>
                    <td>{r.book?.title || r.copy?.bookId}</td>
                    <td>{r.borrowDate}</td>
                    <td>{r.dueDate}</td>
                    <td>{r.returnDate || "-"}</td>
                    <td>
                      {r.returnDate
                        ? "Returned"
                        : new Date(r.dueDate) < new Date()
                          ? "Overdue"
                          : "Borrowing"}
                    </td>
                    <td>{r.daysLate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <button
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </Container>
  );
}
