
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

const PAGE_SIZE = 5;

export default function RecipeList() {
    const [searchParams, setSearchParams] = useSearchParams();

    const requestedPage = Number(searchParams.get("page"));

    const page =
        Number.isSafeInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;

    const [recipes, setRecipes] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const {
        favoritesLoading,
        favoritesReady,
        favoritesError,
        isFavorite,
        isPending,
        toggleFavorite,
        reloadFavorites
    } = useFavorites();

    const totalPages = Math.max(
        1,
        Math.ceil(total / PAGE_SIZE)
    );

    useEffect(() => {
        const controller = new AbortController();

        async function fetchRecipes() {
            setLoading(true);
            setError("");

            try {
                const skip = (page - 1) * PAGE_SIZE;

                const response = await fetch(
                    `https://dummyjson.com/recipes?limit=${PAGE_SIZE}&skip=${skip}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Nepavyko gauti receptų");
                }

                const data = await response.json();

                if (
                    !Array.isArray(data.recipes) ||
                    typeof data.total !== "number"
                ) {
                    throw new Error(
                        "Gauti netinkami receptų duomenys"
                    );
                }

                const availablePages = Math.max(
                    1,
                    Math.ceil(data.total / PAGE_SIZE)
                );

                if (page > availablePages) {
                    setSearchParams(
                        { page: String(availablePages) },
                        { replace: true }
                    );
                    return;
                }

                if (!controller.signal.aborted) {
                    setRecipes(data.recipes);
                    setTotal(data.total);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(
                        err.message || "Nepavyko įkelti receptų"
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchRecipes();

        return () => controller.abort();
    }, [page, setSearchParams]);

    function changePage(newPage) {
        if (
            newPage < 1 ||
            newPage > totalPages ||
            loading
        ) {
            return;
        }

        setSearchParams({
            page: String(newPage)
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    return (
        <main>
            <h1>Receptai</h1>

            <p>Peržiūrėkite mūsų receptų sąrašą</p>

            {favoritesLoading && (
                <p className="status-text">
                    Kraunami mėgstamiausi receptai
                </p>
            )}

            {favoritesError && (
                <div className="error-message">
                    <p role="alert">
                        {favoritesError}
                    </p>

                    <button
                        type="button"
                        onClick={reloadFavorites}
                    >
                        Atnaujinti mėgstamiausių būseną
                    </button>
                </div>
            )}

            {loading ? (
                <p>Kraunami receptai</p>
            ) : error ? (
                <p role="alert">{error}</p>
            ) : (
                <>
                    <p className="recipe-count">
                        Iš viso receptų: {total}
                    </p>

                    {recipes.length === 0 ? (
                        <p>Receptų nerasta</p>
                    ) : (
                        <div className="recipe-list">
                            {recipes.map((recipe) => {
                                const favorite = isFavorite(
                                    recipe.id
                                );

                                const pending = isPending(
                                    recipe.id
                                );

                                return (
                                    <article
                                        className="recipe-card"
                                        key={recipe.id}
                                    >
                                        <Link
                                            className="recipe-card-link"
                                            to={`/recipe/${recipe.id}?page=${page}`}
                                        >
                                            <img
                                                src={recipe.image}
                                                alt={recipe.name}
                                                loading="lazy"
                                            />

                                            <div className="recipe-card-content">
                                                <h2>
                                                    {recipe.name}
                                                </h2>

                                                <p>
                                                    <strong>
                                                        Virtuvė:
                                                    </strong>{" "}
                                                    {recipe.cuisine}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Sudėtingumas:
                                                    </strong>{" "}
                                                    {recipe.difficulty}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Paruošimas:
                                                    </strong>{" "}
                                                    {recipe.prepTimeMinutes} min
                                                </p>

                                                <p>
                                                    <strong>
                                                        Gaminimas:
                                                    </strong>{" "}
                                                    {recipe.cookTimeMinutes} min
                                                </p>

                                                <span className="recipe-more">
                                                    Peržiūrėti receptą
                                                </span>
                                            </div>
                                        </Link>

                                        <div className="recipe-favorite-action">
                                            <button
                                                type="button"
                                                className={
                                                    favorite
                                                        ? "favorite-button active"
                                                        : "favorite-button"
                                                }
                                                disabled={
                                                    !favoritesReady ||
                                                    pending
                                                }
                                                aria-pressed={favorite}
                                                onClick={() =>
                                                    toggleFavorite(recipe)
                                                }
                                            >
                                                {pending
                                                    ? favorite
                                                        ? "Šalinama"
                                                        : "Išsaugoma"
                                                    : favorite
                                                        ? "♥ Pašalinti iš mėgstamiausių"
                                                        : "♡ Pridėti į mėgstamiausius"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    <div
                        className="pagination"
                        role="navigation"
                        aria-label="Receptų puslapiai"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                changePage(page - 1)
                            }
                            disabled={
                                loading || page <= 1
                            }
                        >
                            Ankstesnis
                        </button>

                        <span>
                            Puslapis {page} iš {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                changePage(page + 1)
                            }
                            disabled={
                                loading || page >= totalPages
                            }
                        >
                            Kitas
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}
