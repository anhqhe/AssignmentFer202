import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import '../../styles/BookManagement.css';

export default function AddBook() {
    const { bId } = useParams();
    const [books, setBooks] = useState([]);
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
    const [importCode, setImportCode] = useState('');
    const [visibility, setVisibility] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:9999/books')
            .then(res => setBooks(res.data))
            .catch(err => console.error(err)
            )
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

    const handleAdd = () => {
        if (!validateForm()) {
            alert('Please fix all validation errors before submitting.');
            return;
        }

        // Generate next ID based on existing books
        const maxId = books.reduce((max, book) => {
            const bookId = parseInt(book.id);
            // Only consider valid numeric IDs
            if (!isNaN(bookId) && bookId > max) {
                return bookId;
            }
            return max;
        }, 0);
        const nextId = (maxId + 1).toString();
        console.log('Max book ID:', maxId, '→ Next ID:', nextId);

        const newBook = {
            id: nextId,
            title: title.trim(),
            author: author.trim(),
            isbn: isbn.trim() || '',
            olid: olid.trim() || '',
            subjects: ([...subjects]),
            image: image,
            description: description.trim(),
            hidden: !visibility,
            createTime: Date.now()
        }
        
        if (checkNotDuplicate(newBook)) {
            axios.post('http://localhost:9999/books', newBook)
                .then(res => {
                    if (res.data) {
                        const confirmed = window.confirm('Book added successfully. Do you want to create copies for this book?')
                        if (confirmed) {
                            navigate(`/librarian/copy/add/?book=${res.data.id}`)
                        } else {
                            navigate('/librarian/book_list')
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('An error occured when trying to add the book. Please try again.')
                })
        }
    }

    const checkNotDuplicate = (newBook) => {
        // Priority 1: Check ISBN (only if provided)
        if (newBook.isbn && newBook.isbn.trim()) {
            const duplicateISBN = books.find(b => b.isbn && b.isbn === newBook.isbn);
            if (duplicateISBN) {
                alert(
                    '❌ CANNOT CREATE BOOK - ISBN ALREADY EXISTS\n\n' +
                    `ISBN: ${newBook.isbn}\n\n` +
                    `Existing Book:\n` +
                    `Title: "${duplicateISBN.title}"\n` +
                    `Author: "${duplicateISBN.author}"\n\n` +
                    'Each ISBN must be unique in the system.'
                );
                return false;
            }
        }
        
        // Priority 2: Check OLID (only if provided)
        if (newBook.olid && newBook.olid.trim()) {
            const duplicateOLID = books.find(b => b.olid && b.olid === newBook.olid);
            if (duplicateOLID) {
                alert(
                    '❌ CANNOT CREATE BOOK - OLID ALREADY EXISTS\n\n' +
                    `OLID: ${newBook.olid}\n\n` +
                    `Existing Book:\n` +
                    `Title: "${duplicateOLID.title}"\n` +
                    `Author: "${duplicateOLID.author}"\n\n` +
                    'Each OLID must be unique in the system.'
                );
                return false;
            }
        }
        
        // Priority 3: Check Title + Author combination (STRICT - NO DUPLICATES ALLOWED)
        const duplicateByTitleAuthor = books.find(b => 
            b.title.toLowerCase().trim() === newBook.title.toLowerCase().trim() &&
            b.author.toLowerCase().trim() === newBook.author.toLowerCase().trim()
        );
        
        if (duplicateByTitleAuthor) {
            alert(
                '❌ CANNOT CREATE BOOK - DUPLICATE DETECTED\n\n' +
                `Title: "${newBook.title}"\n` +
                `Author: "${newBook.author}"\n\n` +
                `This exact book already exists in the system:\n` +
                `Book ID: ${duplicateByTitleAuthor.id}\n` +
                `ISBN: ${duplicateByTitleAuthor.isbn || 'N/A'}\n` +
                `OLID: ${duplicateByTitleAuthor.olid || 'N/A'}\n\n` +
                'Books with identical Title and Author are not allowed.'
            );
            return false;
        }
        
        return true;
    }

    const handleImport = async () => {
        try {
            let editionKey;
            const isOLID = importCode.toUpperCase().startsWith("OL") && importCode.toUpperCase().endsWith("M");

            if (isOLID) {
                editionKey = `/books/${importCode}`;
            } else {
                const isbnRes = await axios.get(`https://openlibrary.org/isbn/${importCode}.json`);
                editionKey = isbnRes.data?.key;
            }

            if (!editionKey) {
                console.error("Could not find a book edition for:", importCode);
                return;
            }

            const olidValue = editionKey.replace("/books/", "");
            const editionRes = await axios.get(`https://openlibrary.org${editionKey}.json`);
            const edition = editionRes.data || {};

            let work = null;
            const workKey = Array.isArray(edition.works) && edition.works[0]?.key;
            if (workKey) {
                const workRes = await axios.get(`https://openlibrary.org${workKey}.json`);
                work = workRes.data || null;
            }

            setOLID(olidValue);
            if (isOLID) {
                const foundIsbn = edition.isbn_13?.[0] || edition.isbn_10?.[0] || "";
                setISBN(foundIsbn);
            } else {
                setISBN(importCode);
            }

            const titleVal = edition.title || work?.title || "";
            setTitle(titleVal);

            const rawDesc = edition.description ?? work?.description ?? "";
            let descVal = "";
            if (typeof rawDesc === "string") {
                descVal = rawDesc;
            } else if (rawDesc?.value) {
                descVal = rawDesc.value;
            }
            setDescription(descVal);

            const coverId = edition.covers?.[0] || work?.covers?.[0];
            let imageUrl = "";

            if (coverId) {
                imageUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
            } else if (olidValue) {
                imageUrl = `https://covers.openlibrary.org/b/olid/${olidValue}-L.jpg`;
            }

            if (imageUrl) {
                fetch(imageUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setImage(reader.result);
                        };
                        reader.readAsDataURL(blob);
                    })
                    .catch(err => {
                        console.error("Error fetching image:", err);
                    });
            } else {
                setImage("");
            }


            const authorRefs =
                edition.authors?.map((a) => a.key) ??
                work?.authors?.map((a) => a.author?.key || a.key) ??
                [];

            const uniqueAuthorRefs = Array.from(new Set(authorRefs.filter(Boolean)));

            if (uniqueAuthorRefs.length > 0) {
                const namePromises = uniqueAuthorRefs.map(async (aKey) => {
                    try {
                        const aRes = await axios.get(`https://openlibrary.org${aKey}.json`);
                        return aRes.data?.name || null;
                    } catch (e) {
                        return null;
                    }
                });

                const names = (await Promise.all(namePromises)).filter(Boolean);
                setAuthor(names.join(", "));
            } else {
                setAuthor("");
            }

            // Import subjects/categories
            const openLibSubjects = work?.subjects || edition.subjects || [];
            if (openLibSubjects.length > 0 && allSubs.length > 0) {
                // Match Open Library subjects with database subjects
                const matchedSubjectIds = [];
                
                openLibSubjects.forEach(olSubject => {
                    const normalizedOLSubject = olSubject.toLowerCase().trim();
                    
                    // Find matching subject in database
                    const matchedSub = allSubs.find(dbSub => {
                        const normalizedDBSubject = dbSub.name.toLowerCase().trim();
                        // Exact match or contains
                        return normalizedDBSubject === normalizedOLSubject || 
                               normalizedDBSubject.includes(normalizedOLSubject) ||
                               normalizedOLSubject.includes(normalizedDBSubject);
                    });
                    
                    if (matchedSub && !matchedSubjectIds.includes(matchedSub.id)) {
                        matchedSubjectIds.push(matchedSub.id);
                    }
                });
                
                if (matchedSubjectIds.length > 0) {
                    setSubjects(matchedSubjectIds);
                    console.log("Auto-selected subjects:", matchedSubjectIds);
                } else {
                    console.log("No matching subjects found. Available subjects from Open Library:", openLibSubjects.slice(0, 10));
                }
            }

            console.log("Imported:", { titleVal, olidValue, imageUrl, subjects: openLibSubjects.slice(0, 10) });
        } catch (err) {
            console.error("Error importing book:", err);
            alert('Failed to import book. Please check the ISBN/OLID and try again.');
        }
    };

    return (
        <div className="librarian-page-container">
            <div className="book-manage-hero">
                <div className="book-manage-title">
                    <h2>eFPT Library - Book Management</h2>
                    <h3 className="clamp-title">Add New Book</h3>
                </div>
                <div>
                    <button onClick={() => navigate('/librarian/book_list')}>Back to Book List</button>
                </div>
            </div>
            <div className="p-5">
                <div className="import-container">
                    <h3 className="import-header mb-4"><i className="fa-solid fa-file-import"></i> Import Book Data</h3>
                    <div className="import-desc">Enter an ISBN or OLID to automatically fetch book details from Open Library</div>
                    <div className="d-flex gap-3">
                        <input value={importCode} onChange={e => setImportCode(e.target.value)} className="form-control" placeholder="Enter ISBN (e.g., 9780140328721) or OLID (e.g., OL7353617M)"></input>
                        <button onClick={() => handleImport()} className="import-button"><i className="fa-solid fa-download"></i> Import</button>
                    </div>
                </div>
            </div>
            <div className="form-buttons d-flex justify-content-end gap-3">
                <button onClick={() => navigate('/librarian/book_list')} className="cancel-button"><i className="fa-solid fa-xmark"></i> Cancel</button>
                <button onClick={() => handleAdd()} className="save-button"><i className="fa-solid fa-book-medical"></i> Add Book</button>
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