
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            setError("Užpildykite visus laukus");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/users");

            if (!response.ok) {
                throw new Error("Nepavyko gauti naudotojų duomenų");
            }

            const users = await response.json();

            const user = users.find(
                (item) =>
                    item.email.toLowerCase() === normalizedEmail &&
                    item.password === password
            );

            if (!user) {
                setError("Neteisingas el. paštas arba slaptažodis");
                return;
            }

            login(user);
            navigate("/dashboard", { replace: true });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Prisijungimas</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="El. paštas"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    required
                />

                <input
                    type="password"
                    placeholder="Slaptažodis"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading}
                    required
                />

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Jungiamasi..." : "Prisijungti"}
                </button>
            </form>
        </main>
    );
}
