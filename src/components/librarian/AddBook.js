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
            const newSubjects = [...subjects, sId];
            setSubjects(newSubjects);
            validateField('subjects', newSubjects);
        }
    };

    const removeSubject = (sId) => {
        const newSubjects = subjects.filter(id => id !== sId);
        setSubjects(newSubjects);
        validateField('subjects', newSubjects);
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

            // Clear error and set image
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.image;
                return newErrors;
            });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                validateField('image', reader.result);
            };
            reader.readAsDataURL(imageFile);
        } else {
            // If no file selected, validate that image exists
            validateField('image', image);
        }
    }

    // Validate individual field
    const validateField = (fieldName, value) => {
        const newErrors = { ...errors };
        
        switch (fieldName) {
            case 'title':
                if (!value.trim()) {
                    newErrors.title = 'Title is required';
                } else if (value.trim().length < 1 || value.trim().length > 30) {
                    newErrors.title = 'Title must be between 1 and 30 characters';
                } else {
                    delete newErrors.title;
                }
                break;
                
            case 'author':
                if (!value.trim()) {
                    newErrors.author = 'Author is required';
                } else if (value.trim().length < 1 || value.trim().length > 30) {
                    newErrors.author = 'Author name must be between 1 and 30 characters';
                } else {
                    delete newErrors.author;
                }
                break;
                
            case 'isbn':
                if (value && value.trim()) {
                    const isbnClean = value.replace(/[-\s]/g, '');
                    // ISBN-10: 10 digits, ISBN-13: 13 digits starting with 978 or 979
                    if (!/^\d{10}$/.test(isbnClean) && !/^(978|979)\d{10}$/.test(isbnClean)) {
                        newErrors.isbn = 'ISBN must be 10 digits or 13 digits (starting with 978 or 979)';
                    } else {
                        delete newErrors.isbn;
                    }
                } else {
                    delete newErrors.isbn;
                }
                break;
                
            case 'olid':
                if (value && value.trim()) {
                    // OLID format: OL + digits + letter (e.g., OL7353617M)
                    if (!/^OL\d+[A-Z]$/i.test(value.trim())) {
                        newErrors.olid = 'OLID must be in format: OL + digits + letter (e.g., OL7353617M)';
                    } else {
                        delete newErrors.olid;
                    }
                } else {
                    delete newErrors.olid;
                }
                break;
                
            case 'description':
                if (!value || !value.trim()) {
                    newErrors.description = 'Description is required';
                } else if (value.trim().length < 1 || value.trim().length > 100) {
                    newErrors.description = 'Description must be between 1 and 100 characters';
                } else {
                    delete newErrors.description;
                }
                break;
                
            case 'subjects':
                if (value.length === 0) {
                    newErrors.subjects = 'At least one category is required';
                } else {
                    delete newErrors.subjects;
                }
                break;
                
            case 'image':
                if (!value) {
                    newErrors.image = 'Cover image is required';
                } else {
                    delete newErrors.image;
                }
                break;
                
            default:
                break;
        }
        
        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.trim().length < 1 || title.trim().length > 30) {
            newErrors.title = 'Title must be between 1 and 30 characters';
        }

        if (!author.trim()) {
            newErrors.author = 'Author is required';
        } else if (author.trim().length < 1 || author.trim().length > 30) {
            newErrors.author = 'Author name must be between 1 and 30 characters';
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
            // ISBN-10: 10 digits, ISBN-13: 13 digits starting with 978 or 979
            if (!/^\d{10}$/.test(isbnClean) && !/^(978|979)\d{10}$/.test(isbnClean)) {
                newErrors.isbn = 'ISBN must be 10 digits or 13 digits (starting with 978 or 979)';
            }
        }

        if (olid && olid.trim()) {
            // OLID format: OL + digits + letter (e.g., OL7353617M)
            if (!/^OL\d+[A-Z]$/i.test(olid.trim())) {
                newErrors.olid = 'OLID must be in format: OL + digits + letter (e.g., OL7353617M)';
            }
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.trim().length < 1 || description.trim().length > 100) {
            newErrors.description = 'Description must be between 1 and 100 characters';
        }

        setErrors(newErrors);
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const handleAdd = () => {
        // Validate all fields before submit
        const validation = validateForm();
        if (!validation.isValid) {
            // Scroll to first error field
            setTimeout(() => {
                const firstErrorField = Object.keys(validation.errors)[0];
                if (firstErrorField) {
                    // Find the input/textarea for this field
                    let errorElement = null;
                    if (firstErrorField === 'title') {
                        errorElement = document.querySelector('.librarian-form-input input[value="' + title.replace(/"/g, '\\"') + '"]') || 
                                      document.querySelectorAll('.librarian-form-input input')[0];
                    } else if (firstErrorField === 'author') {
                        const inputs = document.querySelectorAll('.librarian-form-input input');
                        errorElement = inputs[1]; // Author is second input
                    } else if (firstErrorField === 'isbn') {
                        const inputs = document.querySelectorAll('.librarian-form-input input');
                        errorElement = Array.from(inputs).find(input => input.placeholder && input.placeholder.includes('ISBN'));
                    } else if (firstErrorField === 'olid') {
                        const inputs = document.querySelectorAll('.librarian-form-input input');
                        errorElement = Array.from(inputs).find(input => input.placeholder && input.placeholder.includes('OLID'));
                    } else if (firstErrorField === 'description') {
                        errorElement = document.querySelector('.librarian-form-input textarea');
                    } else if (firstErrorField === 'subjects') {
                        errorElement = document.querySelector('.subjects-container');
                    } else if (firstErrorField === 'image') {
                        errorElement = document.querySelector('.librarian-form-input input[type="file"]');
                    }
                    
                    if (errorElement) {
                        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (errorElement.focus) {
                            errorElement.focus();
                        }
                    }
                }
            }, 100);
            return;
        }

        // Generate next ID based on existing books
        // Chỉ xem xét các ID là số nguyên dương hợp lệ (1, 2, 3, ...)
        const maxId = books.reduce((max, book) => {
            const bookId = parseInt(book.id);
            // Chỉ xem xét ID là số nguyên dương hợp lệ và không quá lớn (tránh ID lỗi)
            if (!isNaN(bookId) && bookId > 0 && bookId < 10000 && bookId > max) {
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
            validateField('olid', olidValue);
            
            if (isOLID) {
                const foundIsbn = edition.isbn_13?.[0] || edition.isbn_10?.[0] || "";
                setISBN(foundIsbn);
                validateField('isbn', foundIsbn);
            } else {
                setISBN(importCode);
                validateField('isbn', importCode);
            }

            let titleVal = edition.title || work?.title || "";
            // Truncate to 30 characters if too long
            if (titleVal.length > 30) {
                titleVal = titleVal.substring(0, 30);
            }
            setTitle(titleVal);
            validateField('title', titleVal);

            const rawDesc = edition.description ?? work?.description ?? "";
            let descVal = "";
            if (typeof rawDesc === "string") {
                descVal = rawDesc;
            } else if (rawDesc?.value) {
                descVal = rawDesc.value;
            }
            // Truncate to 100 characters if too long
            if (descVal.length > 100) {
                descVal = descVal.substring(0, 100);
            }
            setDescription(descVal);
            validateField('description', descVal);

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
                            validateField('image', reader.result);
                        };
                        reader.readAsDataURL(blob);
                    })
                    .catch(err => {
                        console.error("Error fetching image:", err);
                        setErrors(prev => ({ ...prev, image: 'Failed to load image from URL' }));
                    });
            } else {
                setImage("");
                validateField('image', "");
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
                let authorVal = names.join(", ");
                // Truncate to 30 characters if too long
                if (authorVal.length > 30) {
                    authorVal = authorVal.substring(0, 30);
                }
                setAuthor(authorVal);
                validateField('author', authorVal);
            } else {
                setAuthor("");
                validateField('author', "");
            }

            // Import subjects/categories - Cải thiện matching logic
            const openLibSubjects = work?.subjects || edition.subjects || [];
            if (openLibSubjects.length > 0 && allSubs.length > 0) {
                const matchedSubjectIds = [];
                
                // Tạo mapping từ keywords đến subject IDs
                const keywordMapping = {
                    'computer': '1', 'programming': '1', 'software': '1', 'algorithm': '1', 'computing': '1',
                    'literature': '2', 'fiction': '2', 'novel': '2', 'literary': '2',
                    'mathematics': '3', 'math': '3', 'mathematical': '3', 'algebra': '3', 'calculus': '3',
                    'science fiction': '4', 'sci-fi': '4', 'sf': '4',
                    'fantasy': '5',
                    'romance': '6',
                    'mystery': '7', 'detective': '7',
                    'horror': '8',
                    'thriller': '9',
                    'history': '10', 'historical': '10',
                    'biography': '11', 'biographical': '11',
                    'philosophy': '12', 'philosophical': '12',
                    'psychology': '13', 'psychological': '13',
                    'religion': '14', 'religious': '14',
                    'politics': '15', 'political': '15',
                    'economics': '16', 'economic': '16',
                    'business': '17',
                    'education': '18', 'educational': '18',
                    'law': '19', 'legal': '19',
                    'medicine': '20', 'medical': '20',
                    'health': '21',
                    'cooking': '22', 'cookbook': '22', 'culinary': '22',
                    'art': '23', 'artistic': '23',
                    'music': '24', 'musical': '24',
                    'film': '25', 'cinema': '25',
                    'photography': '26', 'photo': '26',
                    'architecture': '27', 'architectural': '27',
                    "children's": '28', 'children': '28', 'kids': '28',
                    'young adult': '29', 'ya': '29',
                    'travel': '30', 'traveling': '30',
                    'science': '31', 'scientific': '31',
                    'physics': '32', 'physical': '32',
                    'chemistry': '33', 'chemical': '33',
                    'biology': '34', 'biological': '34',
                    'geography': '35', 'geographical': '35',
                    'anthropology': '36', 'anthropological': '36',
                    'sociology': '37', 'sociological': '37',
                    'self-help': '38', 'self help': '38',
                    'poetry': '39', 'poem': '39', 'poetic': '39',
                    'drama': '40', 'dramatic': '40', 'play': '40'
                };
                
                openLibSubjects.forEach(olSubject => {
                    if (typeof olSubject === 'string') {
                        const normalizedOLSubject = olSubject.toLowerCase().trim();
                        
                        // 1. Thử match bằng keyword mapping
                        for (const [keyword, subjectId] of Object.entries(keywordMapping)) {
                            if (normalizedOLSubject.includes(keyword) && !matchedSubjectIds.includes(subjectId)) {
                                matchedSubjectIds.push(subjectId);
                                break;
                            }
                        }
                        
                        // 2. Nếu chưa match, thử exact match hoặc contains với database subjects
                        if (!matchedSubjectIds.some(id => {
                            const dbSub = allSubs.find(s => s.id === id);
                            return dbSub && normalizedOLSubject.includes(dbSub.name.toLowerCase().trim());
                        })) {
                            const matchedSub = allSubs.find(dbSub => {
                                const normalizedDBSubject = dbSub.name.toLowerCase().trim();
                                return normalizedDBSubject === normalizedOLSubject || 
                                       normalizedDBSubject.includes(normalizedOLSubject) ||
                                       normalizedOLSubject.includes(normalizedDBSubject);
                            });
                            
                            if (matchedSub && !matchedSubjectIds.includes(matchedSub.id)) {
                                matchedSubjectIds.push(matchedSub.id);
                            }
                        }
                    }
                });
                
                if (matchedSubjectIds.length > 0) {
                    setSubjects(matchedSubjectIds);
                    validateField('subjects', matchedSubjectIds);
                    console.log("✅ Auto-selected categories:", matchedSubjectIds.map(id => {
                        const sub = allSubs.find(s => s.id === id);
                        return sub ? sub.name : id;
                    }));
                } else {
                    console.log("⚠️ No matching categories found. Open Library subjects:", openLibSubjects.slice(0, 10));
                    validateField('subjects', []);
                }
            } else {
                // Nếu không có subjects từ Open Library, vẫn validate
                validateField('subjects', subjects);
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
                            <div>Title <span className="text-danger">*</span> <small className="text-muted">(Maximum 30 characters)</small></div>
                            <input 
                                value={title} 
                                onChange={e => {
                                    setTitle(e.target.value);
                                    validateField('title', e.target.value);
                                }}
                                onBlur={() => validateField('title', title)}
                                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                maxLength="30"
                                placeholder="Enter book title (max 30 characters)"
                            />
                            <small className="text-muted d-block mt-1">{title.length}/30 characters</small>
                            {errors.title && <div className="text-danger small mt-1">{errors.title}</div>}
                        </div>
                        <div className="librarian-form-input">
                            <div>Author <span className="text-danger">*</span> <small className="text-muted">(Maximum 30 characters)</small></div>
                            <input 
                                value={author} 
                                onChange={e => {
                                    setAuthor(e.target.value);
                                    validateField('author', e.target.value);
                                }}
                                onBlur={() => validateField('author', author)}
                                className={`form-control ${errors.author ? 'is-invalid' : ''}`}
                                maxLength="30"
                                placeholder="Enter author name (max 30 characters)"
                            />
                            <small className="text-muted d-block mt-1">{author.length}/30 characters</small>
                            {errors.author && <div className="text-danger small mt-1">{errors.author}</div>}
                        </div>
                        <div className="librarian-form-input">
                            <div>Description <span className="text-danger">*</span> <small className="text-muted">(Maximum 100 characters)</small></div>
                            <textarea 
                                value={description} 
                                onChange={e => {
                                    setDescription(e.target.value);
                                    validateField('description', e.target.value);
                                }}
                                onBlur={() => validateField('description', description)}
                                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                rows="5"
                                maxLength="100"
                                placeholder="Enter book description (max 100 characters)"
                            />
                            <small className="text-muted d-block mt-1">{description.length}/100 characters</small>
                            {errors.description && <div className="text-danger small mt-1">{errors.description}</div>}
                        </div>
                    </div>
                    <div>
                        <h3><i className="fa-solid fa-tags"></i> Categories <span className="text-danger">*</span></h3>
                        <div className="d-flex flex-column">
                            {/* Hiển thị các categories đã chọn */}
                            {subjects.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-muted small mb-2">Selected Categories ({subjects.length}):</div>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {subjects.map(subjectId => {
                                            const subject = allSubs.find(s => s.id === subjectId);
                                            if (!subject) return null;
                                            return (
                                                <span 
                                                    key={subjectId}
                                                    className="badge bg-primary d-flex align-items-center gap-2 px-3 py-2"
                                                    style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                                                    onClick={() => removeSubject(subjectId)}
                                                    title="Click to remove"
                                                >
                                                    {subject.name}
                                                    <i className="fa-solid fa-times" style={{ fontSize: '0.8rem' }}></i>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <input 
                                onChange={e => setSubSearch(e.target.value)} 
                                value={subSearch} 
                                className="form-control mb-3" 
                                placeholder="Search and select categories..."
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
                            {subjects.length === 0 && !errors.subjects && (
                                <small className="text-muted mt-2">No categories selected. Please select at least one category.</small>
                            )}
                        </div>
                    </div>
                </div>
                <div className="librarian-form-row">
                    <h3> <i className="fa-solid fa-barcode"></i> Identifiers (Optional)</h3>
                    <div className="librarian-form-input">
                        <div>ISBN <small className="text-muted">(Optional - 10 or 13 digits)</small></div>
                        <input 
                            value={isbn} 
                            onChange={e => {
                                setISBN(e.target.value);
                                validateField('isbn', e.target.value);
                            }}
                            onBlur={() => validateField('isbn', isbn)}
                            className={`form-control ${errors.isbn ? 'is-invalid' : ''}`}
                            placeholder="e.g., 9780140328721 (13 digits) or 0140328726 (10 digits)"
                        />
                        {errors.isbn && <div className="text-danger small mt-1">{errors.isbn}</div>}
                        {!errors.isbn && <small className="text-muted d-block mt-1">Format: 10 digits or 13 digits starting with 978 or 979</small>}
                    </div>
                    <div className="librarian-form-input">
                        <div>OLID <small className="text-muted">(Optional - Open Library ID)</small></div>
                        <input 
                            value={olid} 
                            onChange={e => {
                                setOLID(e.target.value);
                                validateField('olid', e.target.value);
                            }}
                            onBlur={() => validateField('olid', olid)}
                            className={`form-control ${errors.olid ? 'is-invalid' : ''}`}
                            placeholder="e.g., OL7353617M"
                        />
                        {errors.olid && <div className="text-danger small mt-1">{errors.olid}</div>}
                        {!errors.olid && <small className="text-muted d-block mt-1">Format: OL + digits + letter (e.g., OL7353617M)</small>}
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