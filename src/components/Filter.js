import { Form } from 'react-bootstrap';
import '../styles/Homepage.css';

export default function Filter({
    search,
    setSearch,
    subSearch,
    setSubSearch,
    setSubSelector,
    avail,
    setAvail,
    subSelector,
    subjects,
    selectedSubject,
    removeSubject,
    addSubject,
    setSelectedSub
}) {
    return (
        <div className='search-filter-box border rounded-3 p-5 d-flex flex-column gap-3'>
            <div className='d-flex gap-3 align-items-center'>
                <i className="bi bi-search search-icon text-info fs-3"></i>
                <div className='fs-5 fw-medium'>Search & Filter Books</div>
            </div>
            <div className='row g-3'>
                <div className='col-12 col-lg-4'>
                    <div className={`search-input-wrapper d-flex p-2 gap-2 border rounded-2 ${search ? 'active-outline' : ''}`}>
                        <button className='btn border-0 p-0'><i className="bi bi-search"></i></button>
                        <input
                            className='form-control border-0 flex-grow-1 shadow-none'
                            placeholder='Search by title, author, or ISBN...'
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className='col-12 col-md-6 col-lg-4'>
                    <div onClick={() => setSubSelector(true)} className={`subject-input-wrapper d-flex p-2 gap-2 border rounded-2 ${subSearch ? 'active-outline' : ''}`}>
                        <input value={subSearch} onChange={e => setSubSearch(e.target.value)} className='form-control border-0 flex-grow-1 shadow-none'
                            placeholder='Search by category, genre...'></input>
                    </div>
                </div>
                <div className='col-12 col-md-6 col-lg-4'>
                    <Form.Select onChange={e => setAvail(e.target.value)} className={`form-select ${avail !== 'all' ? 'active-outline' : ''}`}>
                        <option value={'all'}>Books</option>
                        <option value={true}>Available</option>
                        <option value={false}>Unavailable</option>
                    </Form.Select>
                </div>
                {subSelector && (
                    <div className='subjects-selector'>
                        <div className='selector-buttons'>
                            <div className='selector-close-button' onClick={() => setSubSelector(false)}>Close</div>
                            <div className='selector-reset-button' onClick={() => setSelectedSub([])}>Reset</div>
                        </div>
                        <div className='subjects-container'>
                            {subjects?.map(s => (
                                selectedSubject(s.id) ? (
                                    <div onClick={() => removeSubject(s.id)} className='subject active' key={s.id}><div>{s.name}</div></div>
                                ) : (
                                    <div onClick={() => addSubject(s.id)} className='subject inactive' key={s.id}><div>{s.name}</div></div>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}