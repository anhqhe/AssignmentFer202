import { Outlet } from 'react-router-dom';
import '../../styles/Librarian.css';
import Sidebar from "./Sidebar";

export default function LibDashboard() {
    return (
        <div>
            <Sidebar/>
            <div className="librarian-dashboard">
                <Outlet/>
            </div>
        </div>
    )
}