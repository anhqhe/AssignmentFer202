import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import bcrypt from 'bcryptjs'
import emailjs from "emailjs-com"
import { Container, Form, FormSelect, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ViewAccounts() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusSort, setStatusSort] = useState("none");
    const [userView, setUserView] = useState([]);
    const user = JSON.parse(localStorage.getItem("userAccount"))
    const navigate = useNavigate()
    if (!user || user.role !== 'Admin') {
        alert("Bạn không có quyền truy cập trang này")
        navigate('/homepage')
    }
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;


    useEffect(() => {
        axios.get("http://localhost:9999/users")
            .then(res => {
                setUsers(res.data)
                setUserView(res.data)
            })
            .catch(err => console.error(err));
    }, []);

    const handleLock = (id) => {
        if (!window.confirm("Do you want to change this account’s access status?")) {
            return;
        }
        let setingUser = users.find(u => u.id === id)
        setingUser.status == "active" ? (setingUser = { ...setingUser, status: "inactive" }) : (setingUser = { ...setingUser, status: "active" })
        axios.patch(`http://localhost:9999/users/${id}`, setingUser)
            .then(res => alert("Change successfuly"))
            .catch(err => console.error(err));
        let newUserView = users.filter(u => u.id != id)
        setUsers([...newUserView, setingUser])
        setUserView([...newUserView, setingUser])
    };

    useEffect(() => {
        let newUserView = [...users];


        if (searchTerm.trim() !== "") {
            newUserView = newUserView.filter(u =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter !== "all") {
            newUserView = newUserView.filter(u => u.role === roleFilter);
        }

        if (statusSort !== "none") {
            newUserView = newUserView.sort((a, b) => {
                return statusSort === "asc" ? (a.status.localeCompare(b.status)) : (b.status.localeCompare(a.status))
            });
        }

        setUserView(newUserView);
    }, [searchTerm, roleFilter, statusSort, users]);

    const handelResetPass = (e, user) => {
        e.preventDefault()
        const defaultPass = "user@123"
        const randomHashPass = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(defaultPass, randomHashPass);

        axios.patch(`http://localhost:9999/users/${user.id}`, { ...user, password: hashPass })
            .then(res => {
                console.log(res);
                sendMail(user, defaultPass)
            })
            .catch(
                res => {
                    console.log("faile to update", res);
                }
            )


    }


    const sendMail = (user, newPass) => {

        emailjs.send(
            serviceId,
            templateId,
            {
                from_name: "System Bot",
                to_email: user?.email,
                message: `Xin chào ${user?.username || "bạn"}, đây là mật khẩu mặc định : ${newPass}. Bạn có thể Sử dung nó để truy câp lại tài khoản của mình và đổi lại mật khẩu. Vui lòng không chia sẻ mã này cho bất kỳ ai khác.`
            },
            publicKey
        )
            .then((result) => {
                alert(" Gửi thành công!");

            })
            .catch((error) => {
                alert("Lỗi gửi mail!");
                console.error("FAILED:", error);
            });
    };
    return (
        <Container className="user-table-container" fluid>
            <h2 className="dashboard-title">Danh sách người dùng</h2>


            <Form className="filters">
                <Form.Control
                    type="text"
                    placeholder="Tìm theo tên hoặc ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <FormSelect value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="all">Tất cả role</option>
                    <option value="Admin">Admin</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Student">Student</option>
                </FormSelect>
                <FormSelect value={statusSort} onChange={e => setStatusSort(e.target.value)}>
                    <option value="none">Không sắp xếp</option>
                    <option value="asc">Sắp xếp trạng thái ↑</option>
                    <option value="desc">Sắp xếp trạng thái ↓</option>
                </FormSelect>
            </Form>


            <Table hover className="user-table">
                <thead>
                    <tr>

                        <th>NGƯỜI DÙNG</th>
                        <th>ID</th>
                        <th>Email</th>
                        <th>LOẠI TÀI KHOẢN</th>
                        <th>NGÀY ĐĂNG KÝ</th>
                        <th>TRẠNG THÁI</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {userView?.map(user => (
                        <tr key={user.id}>
                            <td>
                                <div className="user-info">
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <span className="user-name">{user.username}</span>
                                </div>
                            </td>
                            <td>{user.id}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{new Date(user.createdAt).toLocaleString()}</td>
                            <td>
                                {user.status === "active" ? (
                                    <>
                                        <i
                                            className="bi bi-circle-fill"
                                            style={{ color: "green", fontSize: "10px", marginRight: "5px" }}
                                        ></i>
                                        Hoạt động
                                    </>
                                ) : (
                                    <>
                                        <i
                                            className="bi bi-circle-fill"
                                            style={{ color: "red", fontSize: "10px", marginRight: "5px" }}
                                        ></i>
                                        Bị khóa
                                    </>
                                )}
                            </td>

                            <td className="actions">
                                <button className="view-btn" onClick={() => navigate(`/profile/id/${user.id}/isAuthor/${false}`)}>Xem</button>
                                <button className={`action-link ban-button ${user.status === 'inactive' ? 'unban-button' : ''}`}
                                    onClick={() => handleLock(user.id)}>
                                    <i className={`bi ${user.status === 'inactive' ? 'bi-unlock' : 'bi-ban'}`}></i>
                                    {user.status === 'active' ? "Khóa" : "Mở khóa"}
                                </button>
                                <button
                                    className="action-link reset-pasword-btn"
                                    onClick={(e) => handelResetPass(e, user)}
                                >
                                    <i className="bi bi-arrow-repeat"></i>
                                    Reset Password
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}
