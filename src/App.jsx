
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

function Home() {
  return (
      <section>
        <h1>Receptų programėlė</h1>
        <p>Čia galėsite atrasti receptus ir išsaugoti mėgstamiausius.</p>
        <p>Norėdami naudotis programėle, prisijunkite arba užsiregistruokite.</p>
      </section>
  );
}

function Login() {
  return (
      <section>
        <h1>Prisijungimas</h1>
        <p>Prisijungimo forma bus pridėta kitame etape.</p>
      </section>
  );
}

function Register() {
  return (
      <section>
        <h1>Registracija</h1>
        <p>Registracijos forma bus pridėta kitame etape.</p>
      </section>
  );
}

export default function App() {
  return (
      <BrowserRouter>
        <header>
          <nav>
            <Link to="/">Pagrindinis</Link>
            <Link to="/login">Prisijungti</Link>
            <Link to="/register">Registruotis</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<h1>Puslapis nerastas.</h1>} />
          </Routes>
        </main>
      </BrowserRouter>
  );
}
