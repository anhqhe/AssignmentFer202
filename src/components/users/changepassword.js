import { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import axios from "axios";
import bcrypt from 'bcryptjs'
import { Key, Lock } from "lucide-react";
export default function ChangePasswordForm({ setIsShowChangePass }) {
    const userAccount = JSON.parse(localStorage.getItem("userAccount"));
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const checkPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    
    const handleChangePassword = async () => {
    const checkPassOld = bcrypt.compareSync(oldPassword, userAccount.password)
        if (!checkPassOld) {
            alert("Mật khẩu cũ không đúng");
            return;
        }

        if (!checkPass.test(newPassword)) {
            alert("Mật khẩu mới phải có chữ hoa, chữ thường, số, ký tự đặc biệt và tối thiểu 6 ký tự");
            return;
        }
       
        if (newPassword !== confirmPassword) {
            alert("Xác nhận mật khẩu không khớp");
            return;
        }
        const randomHashPass = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(newPassword, randomHashPass);

        try {
            await axios.put(`http://localhost:9999/users/${userAccount.id}`, {
                ...userAccount,
                password: hashPass,
            });

            localStorage.setItem(
                "userAccount",
                JSON.stringify({ ...userAccount, password: hashPass})
            );

            alert("Đổi mật khẩu thành công!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setIsShowChangePass(false)
        } catch (error) {
            console.error(error);
            alert("Lỗi khi đổi mật khẩu");
        }
    };

    return (
        <Form className="p-3">
            <h4 className="mb-3">Đổi mật khẩu</h4>

            <Form.Group className="mb-3">
                <Form.Label>Mật khẩu cũ</Form.Label>
                <InputGroup>
                    <InputGroup.Text>
                        <Key size={16} />
                    </InputGroup.Text>
                    <Form.Control
                        type = "password"
                        placeholder="Nhập mật khẩu cũ"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <InputGroup>
                    <InputGroup.Text>
                        <Lock size={16} />
                    </InputGroup.Text>
                    <Form.Control
                        type = "password"
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Xác nhận mật khẩu</Form.Label>
                <InputGroup>
                    <InputGroup.Text>
                        <Lock size={16} />
                    </InputGroup.Text>
                    <Form.Control
                        type = "password"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </InputGroup>
            </Form.Group>
             <div className="button-group">
            <Button variant="success" onClick={handleChangePassword} className="w-20">
                Save
            </Button>
            <Button variant="secondary" onClick={() => {
                    setIsShowChangePass(false)
            }} className="w-20">
                Cancel
            </Button>
            </div>
        </Form>
    );
}
