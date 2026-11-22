
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const name = form.name.trim();
        const email = form.email.trim().toLowerCase();

        if (!name || !email || !form.password || !form.confirmPassword) {
            setError("Užpildykite visus laukus");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Įveskite teisingą el. pašto adresą");
            return;
        }

        if (form.password.length < 6) {
            setError("Slaptažodis turi būti bent 6 simbolių");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Slaptažodžiai nesutampa");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/users");
            if (!response.ok) throw new Error("Nepavyko patikrinti naudotojų");

            const users = await response.json();

            if (users.some((user) => user.email.toLowerCase() === email)) {
                setError("Naudotojas su tokiu el. paštu jau egzistuoja");
                return;
            }

            const createResponse = await fetch("http://localhost:3001/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password: form.password,
                }),
            });

            if (!createResponse.ok) throw new Error("Registracija nepavyko");

            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main>
            <h1>Registracija</h1>

            <form onSubmit={handleSubmit}>
                <input
                    name="name"
                    placeholder="Vardas"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                />

                <input
                    name="email"
                    type="email"
                    placeholder="El. paštas"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Slaptažodis"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                />

                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Pakartokite slaptažodį"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                />

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Registruojama..." : "Registruotis"}
                </button>
            </form>
        </main>
    );
}
