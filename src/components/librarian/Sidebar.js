import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const [user, setUser] = useState(null);
    const [active, setActive] = useState('dashboard');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userAccount'));
        setUser(userData);
        if (!userData || userData.role !== 'Librarian') {
            navigate('/homepage');
        }
    }, [navigate]);

    useEffect(() => {
        if (location.pathname.includes("dashboard")) {
            setActive("dashboard");
        } else if (location.pathname.includes("book")) {
            setActive("book");
        } else if (location.pathname.includes("copy")) {
            setActive("copy");
        } else if (location.pathname.includes("update")) {
            setActive("update");
        } else if (location.pathname.includes("history")) {
            setActive("history");
        }
    }, [location]);

    return (
      <div className="librarian-dashboard-sidebar p-0">
        <div onClick={() => navigate("/homepage")} className="dashboard-logo">
          <i className="fas fa-book-open"></i> eFPT Library
        </div>
        <div className="nav-container">
          <button
            onClick={() => navigate("dashboard")}
            className={`dashboard-nav ${active === "dashboard" ? "active" : ""}`}
          >
            <i className="fa-solid fa-book"></i>
            <div className="nav-text">Dashboard</div>
          </button>
          {user?.role === "Librarian" && (
            <button
              onClick={() => navigate("update")}
              className={`dashboard-nav ${active === "update" ? "active" : ""}`}
            >
              <i className="fa-solid fa-right-left"></i>
              <div className="nav-text">Borrow / Return</div>
            </button>
          )}

          <button
            onClick={() => navigate("book_list")}
            className={`dashboard-nav ${active === "book" ? "active" : ""}`}
          >
            <i className="fa-solid fa-book"></i>
            <div className="nav-text">Book Management</div>
          </button>

          <button
            onClick={() => navigate("copy_list")}
            className={`dashboard-nav ${active === "copy" ? "active" : ""}`}
          >
            <i className="fa-solid fa-book-bookmark"></i>
            <div className="nav-text">Copy Management</div>
          </button>
        </div>

        <button
          onClick={() => navigate("history")}
          className={`dashboard-nav ${active === "history" ? "active" : ""}`}
        >
          <i className="fa-solid fa-clock-rotate-left"></i>
          <div className="nav-text">Borrow History</div>
        </button>

        {user && (
          <div
            className="dashboard-profile"
            onClick={() =>
              navigate("/profile/id/" + user.id + "/isAuthor/" + true)
            }
          >
            <img
              src={user.avatar}
              className="rounded-circle object-fit-cover border border-white shadow-lg"
              style={{ width: "50px", height: "50px" }}
              alt="Avatar"
            />
            <div>{user.username}</div>
          </div>
        )}
      </div>
    );
}
