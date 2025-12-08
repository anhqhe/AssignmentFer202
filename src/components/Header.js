import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { useEffect, useState } from "react";

// Không dùng header này nữa. Dùng header V2.

export default function Header() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const userAccount = JSON.parse(localStorage.getItem("userAccount"));

  useEffect(() => {
    if (userAccount) {
      setIsLogin(true);
    }
  }, [userAccount]);

  const handlerLogout = () => {
    if (!userAccount) return;
    localStorage.removeItem("userAccount");
    alert("Đăng xuất thành công!");
    setIsLogin(false);
    setTimeout(() => {
      navigate("/login");
    }, 0);
  };
  const handlerLogin = () => {
    setTimeout(() => {
      navigate("/login");
    }, 0);
  };

  return (
    <>
      {isLogin && (
        <header
          className="header-container"
          onClick={() => navigate("/homepage")}
        >
          <div className="header-brand">
            <div className="header-brand-icon-wrapper">
              <i className="bi bi-book header-brand-icon"></i>
            </div>
            <div className="header-brand-text">
              <div className="header-title">Library Management</div>
              <div className="header-subtitle">Student Access System</div>
            </div>
          </div>
          <div className="header-user-section">
            <div className="header-user-info">
              <i className="bi bi-person header-user-avatar"></i>
              <div>
                <div className="header-user-name">Demo Student</div>
                <div className="header-user-role">Student</div>
              </div>
            </div>
            {isLogin && (
              <div className="header-logout" onClick={() => handlerLogout()}>
                <i className="bi bi-box-arrow-right"></i>
                <div>Logout</div>
              </div>
            )}
            {!isLogin && (
              <div className="header-login" onClick={() => handlerLogin()}>
                <i className="bi bi-box-arrow-in-right"></i>
                <div>Login</div>
              </div>
            )}
          </div>
        </header>
      )}
      {!isLogin && <></>}
    </>
  );
}
