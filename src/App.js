import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Homepage from "./components/Homepage";
import Login from "./components/auth/Login.js";
import Register from "./components/auth/Register.js";
import ForgotPassword from "./components/auth/FogetPass.js";
import BookDetail from "./components/BookDetail.js";
import HeaderV2 from "./components/HeaderV2.js";
import BorrowHistory from "./components/BorrowHistory.js";
import UpdateBorrowReturn from "./components/UpdateBorrowReturn.js";
import Profile from "./components/users/profile.js";
import Footer from "./components/Footer.js";
import LibDashboard from "./components/librarian/LibDashboard.js";
import AdminLayout from "./components/admin/adminlayout.js";
import Dashboard from "./components/admin/Dashboard.js";
import CreateAccountByAdmin from "./components/admin/CreateAccount.js";
import ViewAccounts from "./components/admin/ViewAccounts.js";
import EditBook from "./components/librarian/EditBook.js";
import BookList from "./components/librarian/BookList.js";
import AddBook from "./components/librarian/AddBook.js";
import CopyList from "./components/librarian/CopyList.js";
import AddCopy from "./components/librarian/AddCopy.js";

function Layout({ children }) {
  const location = useLocation();
  const hideOn = ["/librarian"];
  const shouldHide = hideOn.some((path) => location.pathname.startsWith(path));

  return (
    <div
      className="website d-flex flex-column justify-content-between"
      style={{ minHeight: "100vh" }}
    >
      {!shouldHide && <HeaderV2 />}
      {children}
      {!shouldHide && <Footer />}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("userAccount");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}


export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/homepage" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/book/:bId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/id/:id/isAuthor/:isAuthor" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="history" element={<BorrowHistory />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create" element={<CreateAccountByAdmin />} />
            <Route path="viewUsers" element={<ViewAccounts />} />
          </Route>

          <Route path="/librarian" element={<ProtectedRoute><LibDashboard /></ProtectedRoute>}>
            <Route path="dashboard" element={<BookList />} />
            <Route path="book_list" element={<BookList />} />
            <Route path="book/edit/:bId" element={<EditBook />} />
            <Route path="book/add" element={<AddBook />} />
            <Route path="copy_list" element={<CopyList />} />
            <Route path="copy/add" element={<AddCopy />} />
            <Route path="update" element={<UpdateBorrowReturn />} />
            <Route path="history" element={<BorrowHistory />} />
          </Route>
           <Route path="*" element={<Homepage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
