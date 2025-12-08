import { useNavigate } from "react-router-dom";
import "../styles/HeaderV2.css";
import { useEffect, useState } from "react";

export default function HeaderV2() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState(null);
  const userAccount = JSON.parse(localStorage.getItem("userAccount"));

  useEffect(() => {
    if (userAccount) {
      setIsLogin(true);
      setRole(userAccount.role);
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
    <header className="header-container">
      <button className="header-brand" onClick={() => navigate("/homepage")}>
        <div className="header-brand-icon-wrapper">
          <i className="bi bi-book-half header-brand-icon"></i>
        </div>
        <div className="header-brand-text">
          <div className="header-title">Library Management</div>
          <div className="header-subtitle">Student Access System</div>
        </div>
      </button>
      <div className="header-user-section">
        {isLogin && (
          <>
            <button
              className="header-user-info"
              onClick={() =>
                navigate("/profile/id/" + userAccount.id + "/isAuthor/" + true)
              }
            >
              <img
                src={userAccount.avatar}
                alt="avatar"
                className="rounded-circle object-fit-cover border border-white shadow-lg"
                style={{ width: "50px", height: "50px" }}
              />
              <div className="user-info d-flex flex-column align-items-start gap-1">
                <div className="header-user-name">
                  {userAccount?.username || "User"}
                </div>
                <div className="header-user-role">
                  {userAccount?.role || "Student"}
                </div>
              </div>
            </button>
            {isLogin &&
              (role === "Student" ? (
                <button
                  className="header-history"
                  onClick={() => navigate("/history")}
                >
                  <i className="bi bi-hourglass"></i>
                  <div>History</div>
                </button>
              ) : role === "Librarian" ? (
                <button
                  className="header-history"
                  onClick={() => navigate("/librarian/update")}
                >
                  <i className="fa-solid fa-book"></i>
                  <div>Dashboard</div>
                </button>
              ) : role === "Admin" ? (
                <button
                  className="header-history"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  <i className="fa-solid fa-book"></i>
                  <div>Dashboard</div>
                </button>
              ) : null)}

            <button className="header-logout" onClick={handlerLogout}>
              <div className="logout-icon">
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </div>
              <div className="logout-text">Logout</div>
            </button>
          </>
        )}
        {!isLogin && (
          <button className="header-login" onClick={handlerLogin}>
            <div className="login-icon">
              <i className="fa-solid fa-right-to-bracket"></i>
            </div>
            <div className="login-text">Login</div>
          </button>
        )}
      </div>
    </header>
  );
}
