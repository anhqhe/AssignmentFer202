import { useState, useEffect } from "react";
import Filter from "../Filter";
import axios from "axios";
import Pagination from "../Pagination";
import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function BookList() {
    const [allBooks, setAllBooks] = useState([]);
    const [displayBooks, setDisplayBooks] = useState([]);
    const [subjects, setSubjects] = useState(null);
    const [copies, setCopies] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedSub, setSelectedSub] = useState([]);
    const [avail, setAvail] = useState('all');
    const [subSelector, setSubSelector] = useState(false);
    const [subSearch, setSubSearch] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [currPage, setCurrPage] = useState(1);
    const [refresh, setRefresh] = useState(true);
    const limit = 12;
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:9999/books')
            .then(res => {
                const sortedBooks = res.data.sort((a, b) => b.createTime - a.createTime);
                setAllBooks(sortedBooks)
            })
            .catch(err => console.error(err));

        axios.get('http://localhost:9999/subjects')
            .then(res => {
                const data = res.data;
                setSubjects(data.filter(s => s.name.toLowerCase().includes(subSearch.toLowerCase().trim())))
            })
            .catch(err => console.log(err));

        axios.get('http://localhost:9999/copies')
            .then(res => setCopies(res.data))
            .catch(err => console.log(err));
    }, [subSearch, refresh]);

    useEffect(() => {
        if (!allBooks || !copies) return;

        let filteredBooks = allBooks;

        if (search) {
            filteredBooks = filteredBooks.filter(b => {
                const s = search.toLowerCase().trim();
                return (
                    b.title?.toLowerCase().includes(s) ||
                    b.author?.toLowerCase().includes(s) ||
                    b.isbn?.includes(s)
                );
            });
        }

        if (selectedSub.length > 0) {
            filteredBooks = filteredBooks.filter(b =>
                selectedSub.every(subId => b.subjects.includes(subId))
            );
        }

        if (avail !== 'all') {
            filteredBooks = filteredBooks.filter(b => {
                const status = getStatus(b.id);
                const isAvailable = avail === 'true';
                return status.available === isAvailable;
            });
        }

        const newTotalPages = Math.ceil(filteredBooks.length / limit);
        setTotalPages(newTotalPages);

        if ((currPage > newTotalPages && newTotalPages > 0 || newTotalPages === 0)) {
            setCurrPage(1);
        }

        const startIndex = (currPage - 1) * limit;
        const paginatedBooks = filteredBooks.slice(startIndex, startIndex + limit);
        setDisplayBooks(paginatedBooks);

    }, [search, selectedSub, avail, allBooks, copies, currPage]);

    const getStatus = (bId) => {
        let total = 0;
        let count = 0;
        if (copies) {
            copies.forEach(c => {
                if (c.bookId === bId) {
                    total += 1;
                    if (!c.isBorrowed) {
                        count += 1;
                    }
                }
            });
        }

        return {
            count,
            total,
            available: count > 0,
        };
    };

    const addSubject = (sId) => {
        setSelectedSub((prev) => [...prev, sId]);
    };

    const removeSubject = (sId) => {
        setSelectedSub((prev) => prev.filter(id => id !== sId));
    };

    const selectedSubject = (sId) => {
        return selectedSub.includes(sId);
    }

    const toggleStatus = (bId) => {
        let updateBook = displayBooks.find(b => b.id === bId);

        updateBook = ({ ...updateBook, hidden: !updateBook.hidden })
        axios.patch(`http://localhost:9999/books/${bId}`, updateBook)
            .catch(err => console.error(err)
            )
        setRefresh(prev => !prev);
    }

    return (
        <div className="librarian-page-container">
            <Filter
                search={search}
                setSearch={setSearch}
                subSearch={subSearch}
                setSubSearch={setSubSearch}
                setSubSelector={setSubSelector}
                avail={avail}
                setAvail={setAvail}
                subSelector={subSelector}
                subjects={subjects}
                selectedSubject={selectedSubject}
                removeSubject={removeSubject}
                addSubject={addSubject}
                setSelectedSub={setSelectedSub}
            />

            <Button onClick={()=>navigate('/librarian/book/add')} className="btn btn-success add-book-button"><i className="fa-solid fa-plus"></i> Add New Book</Button>

            <Table hover striped className="table-container">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayBooks?.map((b, index) => {
                        const status = getStatus(b.id);

                        return (
                            <tr key={index}>
                                <td className={`book-list-item ${status.available ? 'available' : 'unavailable'}`}>{b.id}</td>
                                <td>{b.title}</td>
                                <td>{b.author}</td>
                                <td>{b.isbn ? b.isbn : 'Not Available'}</td>
                                <td>
                                    <div className={`book-status ${b.hidden ? 'hidden' : 'active'}`}>
                                        {b.hidden ? 'Hidden' : 'Active'}
                                    </div>
                                </td>
                                <td className="book-actions">
                                    <button onClick={() => navigate(`/book/${b.id}`)} className="book-action view">
                                        <i className="fa-solid fa-info"></i>
                                    </button>
                                    <button onClick={()=>navigate(`/librarian/book/edit/${b.id}`)} className="book-action edit">
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    {b.hidden ? (
                                        <button onClick={() => toggleStatus(b.id)} className="book-action unhide">
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                    ) : (
                                        <button onClick={() => toggleStatus(b.id)} className="book-action hide">
                                            <i className="fa-solid fa-eye-slash"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>

            <Pagination
                totalPages={totalPages}
                currPage={currPage}
                setCurrPage={setCurrPage}
            />
        </div>
    )
}