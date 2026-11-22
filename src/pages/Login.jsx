
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

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

            setSuccess(`Sėkmingai prisijungėte, ${user.name}`);
            setPassword("");
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
                {success && <p role="status">{success}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Jungiamasi..." : "Prisijungti"}
                </button>
            </form>
        </main>
    );
}
