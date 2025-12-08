import { useNavigate, useParams } from 'react-router-dom';
import '../styles/BookDetail.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

export default function BookDetail() {
    const { bId } = useParams();
    const [book, setBook] = useState(null);
    const [copies, setCopies] = useState(null);
    const [status, setStatus] = useState(null);
    const [subjects, setSubjects] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('userAccount'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const copiesRes = await axios.get(`http://localhost:9999/copies/?bookId=${bId}&condition=Good`);
                const bookRes = await axios.get(`http://localhost:9999/books/${bId}`);
                const subRes = await axios.get('http://localhost:9999/subjects');
                setCopies(copiesRes.data);
                setBook(bookRes.data);
                setSubjects(subRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bId]);

    useEffect(() => {
        if (copies) getStatus(bId);
    }, [copies]);


    const getStatus = (bId) => {
        const total = copies?.length;
        let count = 0;

        copies?.forEach(c => {
            if (!c.isBorrowed) {
                count += 1;
            }
        })

        let available = count > 0;

        setStatus({
            string: `${count} of ${total}`,
            available: available
        });
        console.log(`${count} of ${total}`);

    };

    if (loading) {
        return (
            <div>Loading</div>
        )
    }
    else {
        return (
            <div className='detail-page-container'>
                <div className='book-detail-container'>
                    <div className='image-container'>
                        <img src={book.image} alt={book.title}></img>
                    </div>

                    <div className='d-flex flex-column gap-3'>
                        <div>
                            <div className='title-text'>
                                {book.title}
                            </div>
                            <div className='author-text d-flex align-items-center'>
                                <div className='author-icon'><i className="fa-solid fa-user-pen"></i></div>
                                <div className='author-name'>
                                    {book.author}
                                </div>
                            </div>
                        </div>

                        <div className='little-detail-container'>
                            {book.subjects.map(s => (
                                <div key={s} className='little-detail'>{subjects.find(subjects => subjects.id === s).name}</div>
                            ))}
                        </div>

                        {status?.available && (
                            <div className="availability-box available">
                                <div className='available-text available'><i className="bi bi-check2-circle available"></i> Available</div>
                                <div className='availability-text'>{status?.string} of copies available</div>
                                <div className='availability-text'>Available for Borrowing - Visit the library to check out this book</div>
                            </div>
                        )}

                        {!status?.available && (
                            <div className="availability-box unavailable">
                                <div className='available-text unavailable'><i className="bi bi-x-circle unavailable"></i> Unavailable</div>
                                <div className='availability-text'>{status?.string} of copies available</div>
                            </div>
                        )}

                        <div className='little-detail-container'>
                            {book.isbn && (
                                <div className='little-detail link'><i className="fa-solid fa-barcode"></i> <a href={`https://openlibrary.org/isbn/${book.isbn}}`} target="_blank" >{book.isbn}</a></div>
                            )}
                            {book.olid && (
                                <div className='little-detail link'><i className="fa-solid fa-barcode"></i> <a href={`https://openlibrary.org/books/${book.olid}}`} target="_blank" >{book.olid}</a></div>
                            )}
                        </div>

                        {user?.role === 'Librarian' && (
                            <div>
                                <Button onClick={() => navigate(`/librarian/book/edit/${book.id}`)}><i className="fa-solid fa-pen-to-square"></i> Edit book</Button>
                            </div>
                        )}

                        <div className='little-detail-container'>
                            <div className='little-detail'>
                                <div className='description-header fw-semibold'><i className="fas fa-align-left"></i> Description</div>
                                <div className='description-body'>{book.description.length===0?'This book does not have a description yet.' :book.description}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}