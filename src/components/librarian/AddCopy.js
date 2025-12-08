import axios from "axios";
import { useEffect, useState } from "react"
import { Button, Col, Row, Table } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AddCopy() {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [count, setCount] = useState(1);
    const [search, setSearch] = useState('');
    const [matchingBooks, setMatchingBooks] = useState([]);
    const [newCopies, setNewCopies] = useState([]);
    const [refresh, setRefresh] = useState(true);
    const [copies, setCopies] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookRes = await axios.get('http://localhost:9999/books');
                const booksData = bookRes.data;
                setBooks(booksData);
                setMatchingBooks(booksData);

                const book = searchParams.get("book");
                if (book) {
                    setSelectedBook(booksData.find(b => b.id === book));
                }

                const copyRes = await axios.get('http://localhost:9999/copies');
                setCopies(copyRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);



    useEffect(() => {
        let filter = books;
        filter = filter.filter(b => b.title.toLowerCase().trim().includes(search.toLowerCase().trim())
            || b.isbn.toLowerCase().trim().includes(search.toLowerCase().trim())
            || b.olid.toLowerCase().trim().includes(search.toLowerCase().trim()))
        setMatchingBooks(filter);
    }, [search])

    useEffect(() => {
        if (count.length !== 0) {
            if (count < 1 || !Number.isInteger(count)) {
                setCount(Math.max(1, Math.floor(count)));
            }
        }
    }, [count]);

    const createCopies = () => {
        if (count.length === 0) {
            alert('Please enter the amount of copies you want to create.')
        }
        else if (!selectedBook) {
            alert('Please select a book.')
        }
        else {
            let confirmed = true;
            if (count >= 30) {
                confirmed = window.confirm('You are about to create a large number of copies. Are you sure you want to continue?');
            }
            if (confirmed) {
                const copy = {
                    bookId: selectedBook.id,
                    condition: "Good",
                    isBorrowed: false,
                    createTime: Date.now()
                }
                for (let i = 0; i < count; i++) {
                    axios.post('http://localhost:9999/copies', copy)
                        .then(res => setNewCopies(prev => ([...prev, res.data])));
                }
                alert(`${count} copies created successfully.`)
            }
        }
    }

    const changeCondition = (cId, value) => {
        let update = copies.find(c => c.id === cId);
        update = ({ ...update, condition: value })
        axios.put(`http://localhost:9999/copies/${cId}`, update)
    }

    return (
        <div className="librarian-page-container">
            <div className="book-manage-hero">
                <div className="book-manage-title">
                    <h2>eFPT Library - Book Management</h2>
                    <h3 className="clamp-title">Add New Copies</h3>
                </div>
                <div>
                    <button onClick={() => navigate('/librarian/copy_list')}>Back to Copy List</button>
                </div>
            </div>

            <div className="form-buttons d-flex justify-content-end gap-3">
                <button onClick={() => navigate('/librarian/copy_list')} className="cancel-button"><i className="fa-solid fa-xmark"></i> Cancel</button>
                <button onClick={() => createCopies()} className="save-button"><i className="fa-solid fa-book-bookmark"></i> Add Copy</button>
            </div>

            <div className='search-filter-box border rounded-3 p-5 d-flex flex-column gap-3'>
                <div className='row g-3'>
                    <div className='col-12 col-lg-6'>
                        <div className="search-input-wrapper d-flex p-2 gap-2 border rounded-2">
                            <button className='btn border-0 p-0'>
                                <i className="bi bi-search"></i>
                            </button>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className='form-control border-0 flex-grow-1 shadow-none'
                                placeholder='Enter book title, ISBN, or OLID...'
                            />
                        </div>
                    </div>

                    <div className='col-12 col-lg-6'>
                        <div className="search-input-wrapper d-flex p-2 gap-2 border rounded-2">
                            <button className='btn border-0 p-0'>
                                <i className="bi bi-search"></i>
                            </button>
                            <input
                                value={count}
                                onChange={e => setCount(e.target.value)}
                                type="number"
                                className='form-control border-0 flex-grow-1 shadow-none'
                                placeholder='Input how many copies you want to add...'
                                step="1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Row>
                <Col sm={6} className="book-selector-container">
                    <Table bordered striped hover>
                        <tbody>
                            {matchingBooks?.map((b, index) => (
                                <tr key={index}>
                                    <td className="p-0">
                                        <button className={`book-selector p-2 ${selectedBook && selectedBook.id === b.id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedBook(b);
                                                setNewCopies([]);
                                            }}>
                                            <strong>{b.id}</strong>{` - ${b.title} (ISBN: `}<strong>{b.isbn.length !== 0 ? `${b.isbn}` : 'null'}</strong>{`, OLID: `}<strong>{b.olid.length !== 0 ? `${b.olid}` : 'null'}</strong>{`)`}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
                <Col sm={6}>
                    {selectedBook ? (
                        <div>
                            <div className="d-flex justify-content-center">
                                <img src={selectedBook.image}></img>
                            </div>
                            <div className="d-flex justify-content-center">
                                <h1>{`${selectedBook.title} - ${selectedBook.author}`}</h1>
                            </div>
                        </div>
                    ) : 'Please select a book.'}
                </Col>
            </Row>
            {newCopies.length !== 0 && (
                <div>
                    <h1>Copies Generated</h1>
                    <Table hover striped>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Condition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newCopies.map((c, index) => (
                                <tr key={index}>
                                    <td>{c.id}</td>
                                    <td>
                                        <select className="form-control" onChange={e => changeCondition(c.id, e.target.value)}>
                                            <option value={'Good'} selected={c.condition === 'Good'}>Good</option>
                                            <option value={'Damaged'} selected={c.condition === 'Damaged'}>Damaged</option>
                                            <option value={'Lost'} selected={c.condition === 'Lost'}>Lost</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

        </div>
    )
}