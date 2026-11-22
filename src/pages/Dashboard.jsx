
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <main>
            <h1>Naudotojo paskyra</h1>

            <h2>Sveiki, {user?.name}!</h2>

            <p>Jūs sėkmingai prisijungėte prie sistemos</p>

            <div>
                <p><strong>Vardas:</strong> {user?.name}</p>
                <p><strong>El. paštas:</strong> {user?.email}</p>
            </div>

            <button onClick={handleLogout}>
                Atsijungti
            </button>
        </main>
    );
}
