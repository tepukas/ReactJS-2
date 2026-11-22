
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
    return (
        <main>
            <h1>Receptų sistema</h1>
            <p>Sveiki atvykę į receptų sistemą</p>
        </main>
    );
}

export default function App() {
    const { isAuthenticated, user } = useAuth();

    return (
        <BrowserRouter>
            <nav>
                <Link to="/">Pradžia</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard">Mano paskyra</Link>
                        <Link to="/recipes">Receptai</Link>
                        <span>Prisijungęs: {user.name}</span>
                    </>
                ) : (
                    <>
                        <Link to="/login">Prisijungti</Link>
                        <Link to="/register">Registruotis</Link>
                    </>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/recipes"
                        element={<RecipeList />}
                    />

                    <Route
                        path="/recipe/:id"
                        element={<RecipeDetail />}
                    />
                </Route>

                <Route
                    path="*"
                    element={
                        <main>
                            <h1>Puslapis nerastas</h1>
                            <Link to="/">Grįžti į pradžią</Link>
                        </main>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
