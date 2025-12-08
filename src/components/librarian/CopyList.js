import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import Pagination from "../Pagination";
import { useNavigate } from "react-router-dom";

export default function CopyList() {
    const [copies, setCopies] = useState([]);
    const [disCopies, setDisCopies] = useState([]);
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [condition, setCondition] = useState('all');
    const [status, setStatus] = useState('all');
    const [totalPages, setTotalPages] = useState(0);
    const [currPage, setCurrPage] = useState(1);
    const [refresh, setRefresh] = useState(true);
    const limit = 12;
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:9999/copies')
            .then(res => {
                const sortedCopies = res.data.sort((a, b) => b.createTime - a.createTime);
                setCopies(sortedCopies);
            })
        axios.get('http://localhost:9999/books')
            .then(res => setBooks(res.data))
    }, [refresh])

    useEffect(() => {
        let filter = copies;
        if (search.length !== 0) {
            const trimmed = search.toLowerCase().trim();
            filter = filter.filter(c => (getTitle(c.bookId) || '').toLowerCase().trim().includes(trimmed)
                || c.id.toLowerCase().trim().startsWith(trimmed)
                || (getISBN(c.bookId) || '').toLowerCase().trim().startsWith(trimmed)
                || (getOLID(c.bookId) || '').toLowerCase().trim().startsWith(trimmed))
        }
        if (condition !== 'all') {
            filter = filter.filter(c => c.condition === condition);
        }
        if (status !== 'all') {
            filter = filter.filter(c => c.isBorrowed === (status === 'true'));
        }

        const newTotalPages = Math.ceil(filter.length / limit);
        setTotalPages(newTotalPages);

        if ((currPage > newTotalPages && newTotalPages > 0 || newTotalPages === 0)) {
            setCurrPage(1);
        }

        const startIndex = (currPage - 1) * limit;
        const paginatedCopies = filter.slice(startIndex, startIndex + limit);
        setDisCopies(paginatedCopies);

    }, [search, condition, status, copies, books, currPage])

    const getTitle = (cId) => {
        return books?.find(b => b.id === cId)?.title;
    }

    const getISBN = (cId) => {
        return books?.find(b => b.id === cId)?.isbn;
    }

    const getOLID = (cId) => {
        return books?.find(b => b.id === cId)?.olid;
    }

    const changeCondition = (cId, value) => {
        let update = copies.find(c => c.id === cId);
        update = ({ ...update, condition: value })
        axios.put(`http://localhost:9999/copies/${cId}`, update)
            .then(res => {
                if (res.data) {
                    alert('Updated successfully');
                    setRefresh(prev => !prev);
                }
            })
    }

    const handleDelete = (cId) => {
        const confirmed = window.confirm('Are you sure you want to delete this copy?');
        if (confirmed) {
            axios.delete(`http://localhost:9999/copies/${cId}`)
                .then(() => {
                    console.log('Deleted Successfully');
                    setRefresh(prev => !prev)
                })
                .catch(err => {
                    console.error('Error deleting copy:', err);
                });
        }
    };


    return (
        <div className="librarian-page-container">
            <div className='search-filter-box border rounded-3 p-5 d-flex flex-column gap-3'>
                <div className='row g-3'>
                    <div className='d-flex gap-3 align-items-center'>
                        <i className="bi bi-search search-icon text-info fs-3"></i>
                        <div className='fs-5 fw-medium'>Search & Filter Copies</div>
                    </div>
                    <div className='col-12 col-lg-4'>
                        <div className="search-input-wrapper d-flex p-2 gap-2 border rounded-2">
                            <button className='btn border-0 p-0'>
                                <i className="bi bi-search"></i>
                            </button>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className='form-control border-0 flex-grow-1 shadow-none'
                                placeholder='Search by title, ID, or ISBN...'
                            />
                        </div>
                    </div>

                    <div className='col-12 col-md-6 col-lg-4'>
                        <select className="form-select" onChange={e => setCondition(e.target.value)}>
                            <option value={'all'}>All Condition</option>
                            <option value={'Good'}>Good</option>
                            <option value={'Damaged'}>Damaged</option>
                            <option value={'Lost'}>Lost</option>
                        </select>
                    </div>

                    <div className='col-12 col-md-6 col-lg-4'>
                        <select className="form-select" onChange={(e => setStatus(e.target.value))}>
                            <option value={'all'}>All Statuses</option>
                            <option value={false}>Available</option>
                            <option value={true}>Borrowed</option>
                        </select>
                    </div>
                </div>
            </div>

            <Button onClick={() => navigate('/librarian/copy/add')} className="btn btn-success add-book-button"><i className="fa-solid fa-plus"></i> Add New Copies</Button>

            <Table hover striped className="table-container">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>TItle</th>
                        <th>Condition</th>
                        <th>Borrowed</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {disCopies?.map((c, index) => (
                        <tr key={index}>
                            <td>{c.id}</td>
                            <td>{getTitle(c.bookId)}</td>
                            <td>
                                <div className={`copy-condition ${c.condition.toLowerCase()}`}>
                                    {c.condition}
                                </div>
                            </td>
                            <td>
                                <div className={`book-status ${c.isBorrowed ? 'hidden' : 'active'}`}>
                                    {c.isBorrowed ? 'Borrowed' : 'Available'}
                                </div>
                            </td>
                            <td>
                                <div className="d-flex gap-2">
                                    <select className="form-control" onChange={e => changeCondition(c.id, e.target.value)}>
                                        <option value={'Good'} selected={c.condition === 'Good'}>Good</option>
                                        <option value={'Damaged'} selected={c.condition === 'Damaged'}>Damaged</option>
                                        <option value={'Lost'} selected={c.condition === 'Lost'}>Lost</option>
                                    </select>
                                    <button onClick={() => handleDelete(c.id)} className={`book-action hide ${c.isBorrowed && c.condition !== 'Lost' && 'disabled'}`} disabled={c.isBorrowed && c.condition !== 'Lost'}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
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