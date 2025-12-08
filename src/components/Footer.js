import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer className="page-container footer-container">
            <div className='footer-content'>
                <div className='d-flex flex-column justify-content-center align-items-center'>
                    <div className='footer-header'>eFPT Library – Your Gateway to Academic Resources at FPT University</div>
                    <div>Supporting FPT students with trusted resources for learning, research, and success.</div>
                </div>
                <div className='brand-container'>
                    <i className="fa-brands fa-facebook"></i>
                    <i className="fa-brands fa-twitter"></i>
                    <i className="fa-brands fa-instagram"></i>
                    <i className="fa-brands fa-goodreads-g"></i>
                </div>
            </div>
        </footer>
    )
}