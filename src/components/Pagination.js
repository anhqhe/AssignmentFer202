import { useState, useEffect } from 'react';
import '../styles/Homepage.css';

export default function Pagination({ totalPages, currPage, setCurrPage }) {
    const [pages, setPages] = useState([]);

    useEffect(() => {
        const getPages = (totalPages, currPage) => {
            if (!totalPages) return;
            let pagesArray = [];
            if (totalPages <= 10) {
                for (let i = 1; i <= totalPages; i++) {
                    pagesArray.push(i);
                }
            }
            else {
                if (currPage <= 5) {
                    for (let i = 1; i <= 7; i++) {
                        pagesArray.push(i);
                    }
                    pagesArray.push('...');
                    pagesArray.push(totalPages);
                }
                else if (currPage >= totalPages - 4) {
                    pagesArray.push(1);
                    pagesArray.push('...');
                    for (let i = totalPages - 5; i <= totalPages; i++) {
                        pagesArray.push(i);
                    }
                }
                else {
                    pagesArray.push(1);
                    pagesArray.push('...');
                    const left = currPage - 2;
                    const right = currPage + 2;
                    for (let i = left; i <= right; i++) {
                        pagesArray.push(i);
                    }
                    pagesArray.push('...');
                    pagesArray.push(totalPages);
                }
            }
            setPages(pagesArray);
        };

        getPages(totalPages, currPage);
    }, [totalPages, currPage]);

    const handlePageClick = (p) => {
        if (p !== '...') {
            setCurrPage(p);
        }
    };

    const handlePrevious = () => {
        if (currPage > 1) {
            setCurrPage(currPage - 1);
        }
    };

    const handleNext = () => {
        if (currPage < totalPages) {
            setCurrPage(currPage + 1);
        }
    };

    if (!totalPages || totalPages <= 1) {
        return null;
    }

    return (
        <div className='d-flex justify-content-center'>
            <div className='pagination-bar'>
                <div className='left-arrow-container' onClick={handlePrevious}>
                    <span className='left-arrow'><i className="fa-solid fa-arrow-left"></i></span> Previous
                </div>
                {pages?.map((p, index) => (
                    <div
                        key={index}
                        className={`pagination-page ${currPage === p ? 'active' : ''} ${p === '...' ? 'etc' : ''}`}
                        onClick={() => handlePageClick(p)}
                    >
                        {p}
                    </div>
                ))}
                <div className='right-arrow-container' onClick={handleNext}>
                    Next <span className='right-arrow'><i className="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    );
}