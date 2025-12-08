import React, { useEffect, useState } from "react";
import axios from "axios";

const RATE_PER_DAY = 5000;

export default function UpdateBorrowReturn() {
  const [borrows, setBorrows] = useState([]);
  const [copies, setCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]); 
  const [form, setForm] = useState({ bookId: "", studentId: "", days: 14 });

  useEffect(() => {
    (async () => {
      try {
        const [bh, cp, bk, us] = await Promise.all([
          axios.get("http://localhost:9999/borrowHistory"),
          axios.get("http://localhost:9999/copies"),
          axios.get("http://localhost:9999/books"),
          axios.get("http://localhost:9999/users"), 
        ]);
        setBorrows(bh.data || []);
        setCopies(cp.data || []);
        setBooks(bk.data || []);
        setUsers(us.data || []);
      } catch (err) {
        console.log("Error loading data", err);
      }
    })();
  }, []);

  const calcLateDays = (dueDate, returnDate = new Date()) => {
    const late = Math.ceil(
      (returnDate - new Date(dueDate)) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, late);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    const { bookId, studentId, days } = form;
    if (!bookId || !studentId) return;

    const student = users.find(
      (u) => u.id === studentId && u.role.toLowerCase() === "student"
    );
    if (!student) {
      alert("Student does not exist");
      return;
    }

    const availableCopy = copies.find(
      (c) => c.bookId === bookId && !c.isBorrowed && c.condition === "Good"
    );
    if (!availableCopy) {
      alert("No available copies left for this book!");
      return;
    }

    const today = new Date();
    const due = new Date(today);
    due.setDate(today.getDate() + Number(days));

    const borrow = {
      id: String(Date.now()),
      studentId,
      copyId: availableCopy.id,
      borrowDate: today.toISOString().slice(0, 10),
      dueDate: due.toISOString().slice(0, 10),
      returnDate: null,
    };

    try {
      await axios.post("http://localhost:9999/borrowHistory", borrow);
      await axios.patch(`http://localhost:9999/copies/${availableCopy.id}`, {
        isBorrowed: true,
      });

      setBorrows([borrow, ...borrows]);
      setCopies(
        copies.map((c) =>
          c.id === availableCopy.id ? { ...c, isBorrowed: true } : c
        )
      );
      setForm({ bookId: "", studentId: "", days: 14 });
    } catch (err) {
      console.log("Borrow error", err);
    }
  };

  const handleReturn = async (borrow) => {
    if (borrow.returnDate) return;

    const confirmReturn = window.confirm(
      `Confirmation of return of books to Student ${borrow.studentId}?`
    );
    if (!confirmReturn) return;

    const retDate = new Date().toISOString().slice(0, 10);

    try {
      await axios.patch(`http://localhost:9999/borrowHistory/${borrow.id}`, {
        returnDate: retDate,
      });
      await axios.patch(`http://localhost:9999/copies/${borrow.copyId}`, {
        isBorrowed: false,
      });

      setBorrows(
        borrows.map((b) =>
          b.id === borrow.id ? { ...b, returnDate: retDate } : b
        )
      );
      setCopies(
        copies.map((c) =>
          c.id === borrow.copyId ? { ...c, isBorrowed: false } : c
        )
      );
    } catch (err) {
      console.log("Return error", err);
    }
  };

  const activeBorrows = borrows
    .filter((b) => !b.returnDate)
    .sort((a, b) => new Date(b.borrowDate) < new Date(a.borrowDate) ? 1 : -1);

  const bookWithAvailableCopies = books
    .map((bk) => {
      const remaining = copies.filter(
        (c) => c.bookId === bk.id && !c.isBorrowed && c.condition === "Good"
      ).length;
      return { ...bk, remaining };
    })
    .filter((bk) => bk.remaining > 0);

  const searchedBooks = bookWithAvailableCopies.filter((bk) => {
    const keyword = form.bookId.toLowerCase();
    return (
      bk.id.toLowerCase().includes(keyword) ||
      bk.title.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="p-3">
      <h4>Update Borrow / Return</h4>

      <div className="card p-4 mb-4">
        <h6>Borrow Book</h6>
        <div className="mb-2 text-muted">
          <small>Late fee: {RATE_PER_DAY.toLocaleString()} VND/day</small>
        </div>

        {bookWithAvailableCopies.length === 0 && (
          <div className="text-danger mb-2">
            No books available for borrowing!
          </div>
        )}

        <form className="row g-2" onSubmit={handleBorrow}>
          <div className="col-md-5">
            <label>Search Book</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by book ID or title"
              value={form.bookId}
              onChange={(e) => setForm({ ...form, bookId: e.target.value })}
              disabled={bookWithAvailableCopies.length === 0}
            />
            <div
              className="list-group mt-1"
              style={{ maxHeight: "150px", overflowY: "auto" }}
            >
              {searchedBooks.map((bk) => (
                <button
                  type="button"
                  key={bk.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => setForm({ ...form, bookId: bk.id })}
                >
                  {bk.title} ({bk.remaining} copies left)
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-4">
            <label>Student ID</label>
            <input
              className="form-control"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              placeholder="Enter student ID"
              disabled={bookWithAvailableCopies.length === 0}
            />
          </div>

          <div className="col-md-2">
            <label>Days</label>
            <input
              type="number"
              min="1"
              max="14"
              className="form-control"
              value={form.days}
              onChange={(e) => setForm({ ...form, days: e.target.value })}
              disabled={bookWithAvailableCopies.length === 0}
            />
          </div>

          <div className="col-md-1 d-flex align-items-start">
            <button
              className="btn btn-primary w-100"
              disabled={bookWithAvailableCopies.length === 0}
              style={{ marginTop: "22%" }}
            >
              Borrow
            </button>
          </div>
        </form>
      </div>

      <div className="card p-3">
        <h6>Not Returned</h6>

        {activeBorrows.length === 0 ? (
          <div>No records</div>
        ) : (
          activeBorrows.map((b) => {
            const copy = copies.find((c) => c.id === b.copyId);
            const book = books.find((x) => x.id === copy?.bookId);
            const lateDays = calcLateDays(b.dueDate);
            const fine = lateDays * RATE_PER_DAY;

            return (
              <div
                key={b.id}
                className="border rounded p-2 mb-2 d-flex justify-content-between"
              >
                <div>
                  <div>
                    <b>Student:</b> {b.studentId}
                  </div>
                  <div>
                    <b>Book:</b> {book?.title} ({b.copyId})
                  </div>
                  <div>
                    <b>Borrow:</b> {b.borrowDate} | <b>Due:</b> {b.dueDate}
                  </div>
                  {fine > 0 && (
                    <div className="text-danger">
                      <b>Fine:</b> {fine.toLocaleString()} VND ({lateDays} day
                      overdue)
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-success"
                  onClick={() => handleReturn(b)}
                >
                  Return
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
