import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import '../../styles/BookManagement.css';

export default function EditBook() {
    const { bId } = useParams();
    const [book, setBook] = useState({});
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [isbn, setISBN] = useState('');
    const [olid, setOLID] = useState('');
    const [image, setImage] = useState('');
    const [allSubs, setAllSubs] = useState([]);
    const [displaySubs, setDisplaySubs] = useState([]);
    const [subSearch, setSubSearch] = useState('');
    const [visibility, setVisibility] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:9999/books/${bId}`)
            .then(res => {
                const data = res.data;
                setBook(data);
                setTitle(data.title);
                setAuthor(data.author);
                setDescription(data.description);
                setSubjects(data.subjects);
                setISBN(data.isbn);
                setOLID(data.olid);
                setImage(data.image);
            })
            .catch(err => console.error(err))
        axios.get('http://localhost:9999/subjects')
            .then(res => {
                const data = res.data;
                setAllSubs(data);
                setDisplaySubs(data);
            })
            .catch(err => console.error(err)
            )
    }, [bId])

    useEffect(() => {
        if (subSearch !== '') {
            let filterSubs = allSubs.filter(s => s.name.toLowerCase().trim().includes(subSearch.toLowerCase().trim()))
            let chosen = allSubs.filter(s => subjects.includes(s.id))
            filterSubs = filterSubs.filter(s => !subjects.includes(s.id))
            setDisplaySubs([...chosen, ...filterSubs]);
        } else { setDisplaySubs(allSubs) };
    }, [subSearch, allSubs, subjects])

    const addSubject = (sId) => {
        if (!subjects.includes(sId)) {
            setSubjects(prev => [...prev, sId]);
        }
    };

    const removeSubject = (sId) => {
        setSubjects(prev => prev.filter(id => id !== sId));
    };

    const selectedSubject = (sId) => {
        return subjects.includes(sId);
    };

    const ImageBase64 = (image) => {
        if (image) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(image);
        }
    }

    const handleEdit = () => {
        if (subjects.length === 0 || title.length === 0 || author.length === 0 || image.length === 0) {
            alert('Please fill all required fields.')
        } else {
            const newBook = {
                title: title,
                author: author,
                isbn: isbn,
                olid: olid,
                subjects: ([...subjects]),
                image: image,
                description: description,
                hidden: !visibility
            }
            axios.patch(`http://localhost:9999/books/${bId}`, newBook)
                .then(res => {
                    if (res.data) {
                        alert('Book updated successfully!');
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('An error occured when trying to edit the book. Please try again.')
                })
        }
    }

    return (
        <div className="librarian-page-container">
            <div className="book-manage-hero">
                <div className="book-manage-title">
                    <h2>eFPT Library - Book Management</h2>
                    <h3 className="clamp-title">Editting Book #{book.id} - {book.title}</h3>
                </div>
                <div>
                    <button onClick={() => navigate('/librarian/book_list')}>Back to Book List</button>
                </div>
            </div>
            <div className="form-buttons d-flex justify-content-end gap-3">
                <button onClick={() => navigate('/librarian/book_list')} className="cancel-button"><i className="fa-solid fa-xmark"></i> Cancel</button>
                <button onClick={() => handleEdit()} className="save-button"><i className="fa-solid fa-floppy-disk"></i> Save Edit</button>
            </div>
            <div className="librarian-form-container">
                <div className="librarian-form-row">
                    <div className="mb-3">
                        <h3><i className="fa-solid fa-circle-info"></i> Basic Information</h3>
                        <div className="librarian-form-input">
                            <div>Title <span className="text-danger">*</span></div>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="form-control"></input>
                        </div>
                        <div className="librarian-form-input">
                            <div>Author <span className="text-danger">*</span></div>
                            <input value={author} onChange={e => setAuthor(e.target.value)} className="form-control"></input>
                        </div>
                        <div className="librarian-form-input">
                            <div>Description</div>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-control"></textarea>
                        </div>
                    </div>
                    <div>
                        <h3><i className="fa-solid fa-tags"></i> Categories <span className="text-danger">*</span></h3>
                        <div className="d-flex flex-column">
                            <input onChange={e => setSubSearch(e.target.value)} value={subSearch} className="form-control mb-3" placeholder="Search subject..."></input>
                            <div className='subjects-container'>
                                {displaySubs?.map(s => (
                                    selectedSubject(s.id) ? (
                                        <div onClick={() => removeSubject(s.id)} className='subject active' key={s.id}><div>{s.name}</div></div>
                                    ) : (
                                        <div onClick={() => addSubject(s.id)} className='subject inactive' key={s.id}><div>{s.name}</div></div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="librarian-form-row">
                    <h3> <i className="fa-solid fa-barcode"></i> Identifiers</h3>
                    <div className="librarian-form-input">
                        <div>ISBN</div>
                        <input value={isbn} onChange={e => setISBN(e.target.value)} className="form-control"></input>
                    </div>
                    <div className="librarian-form-input">
                        <div>OLID</div>
                        <input value={olid} onChange={e => setOLID(e.target.value)} className="form-control"></input>
                    </div>
                    <div className="librarian-form-input">
                        <div>Visibility</div>
                        <div className="d-flex gap-2 align-items-center mt-3 mb-3">
                            <h6 className='m-0'>Hidden</h6>
                            <button onClick={() => setVisibility(prev => !prev)} className={`toggle-slider ${visibility ? 'active' : 'inactive'}`}></button>
                            <h6 className="m-0">Visible</h6>
                        </div>
                    </div>
                    <div className="librarian-form-input">
                        <div>Cover Image <span className="text-danger">*</span></div>
                        <input className="form-control mb-3" onChange={e => ImageBase64(e.target.files[0])} type="file" accept="image/*"></input>
                        <img className="book-form-display-image" src={image} alt="Cover"></img>
                    </div>
                </div>
            </div>
        </div>
    )
}