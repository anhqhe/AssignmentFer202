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
    const [errors, setErrors] = useState({});
    const [allBooks, setAllBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:9999/books/${bId}`)
            .then(res => {
                const data = res.data;
                setBook(data);
                setTitle(data.title || '');
                setAuthor(data.author || '');
                setDescription(data.description || '');
                setSubjects(data.subjects || []);
                setISBN(data.isbn || '');
                setOLID(data.olid || '');
                setImage(data.image || '');
                setVisibility(!data.hidden); // Fix visibility bug
            })
            .catch(err => {
                console.error(err);
                alert('Failed to load book data');
                navigate('/librarian/book_list');
            });

        axios.get('http://localhost:9999/subjects')
            .then(res => {
                const data = res.data;
                setAllSubs(data);
                setDisplaySubs(data);
            })
            .catch(err => console.error(err));

        axios.get('http://localhost:9999/books')
            .then(res => setAllBooks(res.data))
            .catch(err => console.error(err));
    }, [bId, navigate])

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

    const ImageBase64 = (imageFile) => {
        if (imageFile) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(imageFile.type)) {
                setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, GIF, WEBP)' }));
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (imageFile.size > maxSize) {
                setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
                return;
            }

            setErrors(prev => ({ ...prev, image: '' }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(imageFile);
        }
    }

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.trim().length < 1 || title.trim().length > 500) {
            newErrors.title = 'Title must be between 1 and 500 characters';
        }

        if (!author.trim()) {
            newErrors.author = 'Author is required';
        } else if (author.trim().length < 1 || author.trim().length > 300) {
            newErrors.author = 'Author name must be between 1 and 300 characters';
        }

        if (subjects.length === 0) {
            newErrors.subjects = 'At least one category is required';
        }

        if (!image) {
            newErrors.image = 'Cover image is required';
        }

        // Optional but must be valid if provided
        if (isbn && isbn.trim()) {
            const isbnClean = isbn.replace(/[-\s]/g, '');
            if (!/^\d{10}(\d{3})?$/.test(isbnClean)) {
                newErrors.isbn = 'ISBN must be 10 or 13 digits';
            }
        }

        if (description && description.trim().length > 5000) {
            newErrors.description = 'Description must be less than 5000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkNotDuplicate = (updatedBook) => {
        // Priority 1: Check ISBN (if changed)
        if (updatedBook.isbn && updatedBook.isbn !== book.isbn) {
            if (allBooks.some(b => b.id !== bId && b.isbn && b.isbn === updatedBook.isbn)) {
                alert('❌ A book with the same ISBN already exists.\n\nISBN: ' + updatedBook.isbn + '\n\nEach ISBN must be unique.');
                return false;
            }
        }
        
        // Priority 2: Check OLID (if changed)
        if (updatedBook.olid && updatedBook.olid !== book.olid) {
            if (allBooks.some(b => b.id !== bId && b.olid && b.olid === updatedBook.olid)) {
                alert('❌ A book with the same OLID already exists.\n\nOLID: ' + updatedBook.olid + '\n\nEach OLID must be unique.');
                return false;
            }
        }
        
        // Priority 3: Check Title + Author combination (if either changed)
        const titleChanged = updatedBook.title.toLowerCase().trim() !== book.title.toLowerCase().trim();
        const authorChanged = updatedBook.author.toLowerCase().trim() !== book.author.toLowerCase().trim();
        
        if (titleChanged || authorChanged) {
            const duplicateByTitleAuthor = allBooks.find(b => 
                b.id !== bId &&
                b.title.toLowerCase().trim() === updatedBook.title.toLowerCase().trim() &&
                b.author.toLowerCase().trim() === updatedBook.author.toLowerCase().trim()
            );
            
            if (duplicateByTitleAuthor) {
                const message = `⚠️ A book with the same Title and Author already exists:\n\n` +
                              `Title: "${duplicateByTitleAuthor.title}"\n` +
                              `Author: "${duplicateByTitleAuthor.author}"\n` +
                              `ISBN: ${duplicateByTitleAuthor.isbn || 'N/A'}\n` +
                              `OLID: ${duplicateByTitleAuthor.olid || 'N/A'}\n\n` +
                              `Are you sure you want to update to these values?`;
                
                return window.confirm(message);
            }
        }
        
        return true;
    };

    const handleEdit = () => {
        if (!validateForm()) {
            alert('Please fix all validation errors before submitting.');
            return;
        }

        const updatedBook = {
            title: title.trim(),
            author: author.trim(),
            isbn: isbn.trim() || '',
            olid: olid.trim() || '',
            subjects: ([...subjects]),
            image: image,
            description: description.trim(),
            hidden: !visibility
        };

        if (checkNotDuplicate(updatedBook)) {
            axios.patch(`http://localhost:9999/books/${bId}`, updatedBook)
                .then(res => {
                    if (res.data) {
                        alert('Book updated successfully!');
                        navigate('/librarian/book_list');
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('An error occurred when trying to edit the book. Please try again.');
                });
        }
    }

    return (
        <div className="librarian-page-container">
            <div className="book-manage-hero">
                <div className="book-manage-title">
                    <h2>eFPT Library - Book Management</h2>
                    <h3 className="clamp-title">Editing Book #{book.id} - {book.title}</h3>
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
                            <input 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                maxLength="500"
                            />
                            {errors.title && <div className="text-danger small mt-1">{errors.title}</div>}
                        </div>
                        <div className="librarian-form-input">
                            <div>Author <span className="text-danger">*</span></div>
                            <input 
                                value={author} 
                                onChange={e => setAuthor(e.target.value)} 
                                className={`form-control ${errors.author ? 'is-invalid' : ''}`}
                                maxLength="300"
                            />
                            {errors.author && <div className="text-danger small mt-1">{errors.author}</div>}
                        </div>
                        <div className="librarian-form-input">
                            <div>Description</div>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                rows="5"
                                maxLength="5000"
                            />
                            {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
                            <small className="text-muted">{description.length}/5000 characters</small>
                        </div>
                    </div>
                    <div>
                        <h3><i className="fa-solid fa-tags"></i> Categories <span className="text-danger">*</span></h3>
                        <div className="d-flex flex-column">
                            <input 
                                onChange={e => setSubSearch(e.target.value)} 
                                value={subSearch} 
                                className="form-control mb-3" 
                                placeholder="Search subject..."
                            />
                            <div className='subjects-container'>
                                {displaySubs?.map(s => (
                                    selectedSubject(s.id) ? (
                                        <div onClick={() => removeSubject(s.id)} className='subject active' key={s.id}><div>{s.name}</div></div>
                                    ) : (
                                        <div onClick={() => addSubject(s.id)} className='subject inactive' key={s.id}><div>{s.name}</div></div>
                                    )
                                ))}
                            </div>
                            {errors.subjects && <div className="text-danger small mt-2">{errors.subjects}</div>}
                        </div>
                    </div>
                </div>
                <div className="librarian-form-row">
                    <h3> <i className="fa-solid fa-barcode"></i> Identifiers (Optional)</h3>
                    <div className="librarian-form-input">
                        <div>ISBN <small className="text-muted">(Optional - 10 or 13 digits)</small></div>
                        <input 
                            value={isbn} 
                            onChange={e => setISBN(e.target.value)} 
                            className={`form-control ${errors.isbn ? 'is-invalid' : ''}`}
                            placeholder="e.g., 9780140328721 or 0140328726"
                        />
                        {errors.isbn && <div className="text-danger small mt-1">{errors.isbn}</div>}
                    </div>
                    <div className="librarian-form-input">
                        <div>OLID <small className="text-muted">(Optional - Open Library ID)</small></div>
                        <input 
                            value={olid} 
                            onChange={e => setOLID(e.target.value)} 
                            className="form-control"
                            placeholder="e.g., OL7353617M"
                        />
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
                        <small className="text-muted d-block mb-2">Max 5MB. Recommended: 300x450px or 2:3 aspect ratio. Formats: JPEG, PNG, GIF, WEBP</small>
                        <input 
                            className={`form-control mb-3 ${errors.image ? 'is-invalid' : ''}`} 
                            onChange={e => ImageBase64(e.target.files[0])} 
                            type="file" 
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        />
                        {errors.image && <div className="text-danger small mb-2">{errors.image}</div>}
                        {image && (
                            <div className="book-image-preview">
                                <img className="book-form-display-image" src={image} alt="Cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
