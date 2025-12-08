import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import '../../styles/BookManagement.css';
import { Button } from "react-bootstrap";

export default function AddBook() {
    const { bId } = useParams();
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [bookISBN, setbookISBN] = useState('');
    const [olid, setOLID] = useState('');
    const [image, setImage] = useState('');
    const [allSubs, setAllSubs] = useState([]);
    const [displaySubs, setDisplaySubs] = useState([]);
    const [subSearch, setSubSearch] = useState('');
    const [importCode, setImportCode] = useState('');
    const [visibility, setVisibility] = useState(true);
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
    }, [subSearch])

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

    const handleAdd = () => {
        if (subjects.length == 0 || title.length == 0 || author.length == 0 || image.length == 0) {
            alert('Please fill all required fields.')
        } else {
            const newBook = {
                title: title,
                author: author,
                isbn: bookISBN,
                olid: olid,
                subjects: ([...subjects]),
                image: image,
                description: description,
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
    }

    const checkNotDuplicate = (newBook) => {
        if (books.some(b => b.olid === newBook.olid)) {
            alert('A book with the same OLID already exists.')
            return false;
        }
        else if (books.some(b => b.isbn === newBook.isbn)) {
            alert('A book with the same ISBN already exists.')
            return false;

        } else if (books.some(b => b.title === newBook.title)) {
            return window.confirm('A book with the same title already exists. Are you sure you want to create this book?');
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
                setbookISBN(foundIsbn);
            } else {
                setbookISBN(importCode);
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

            console.log("Imported:", { titleVal, olidValue, imageUrl });
        } catch (err) {
            console.error("Error importing book:", err);
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
                    <div className="import-desc">Enter an bookISBN or OLID to automatically fetch book details</div>
                    <div className="d-flex gap-3">
                        <input value={importCode} onChange={e => setImportCode(e.target.value)} className="form-control" placeholder="Enter bookISBN or OLID"></input>
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
                        <div>bookISBN</div>
                        <input value={bookISBN} onChange={e => setbookISBN(e.target.value)} className="form-control"></input>
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
                        {image && (
                            <img className="book-form-display-image" src={image} alt="Cover"></img>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}