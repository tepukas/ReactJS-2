
import { useEffect, useState } from "react";
import {
    Link,
    useParams,
    useSearchParams
} from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

export default function RecipeDetail() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const requestedPage = Number(searchParams.get("page"));

    const previousPage =
        Number.isSafeInteger(requestedPage) &&
        requestedPage > 0
            ? requestedPage
            : 1;

    const fromFavorites =
        searchParams.get("from") === "favorites";

    const backUrl = fromFavorites
        ? "/favorites"
        : `/recipes?page=${previousPage}`;

    const backText = fromFavorites
        ? "← Grįžti į mėgstamiausius"
        : "← Grįžti į receptus";

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const {
        favoritesReady,
        favoritesError,
        isFavorite,
        isPending,
        toggleFavorite,
        reloadFavorites
    } = useFavorites();

    useEffect(() => {
        const controller = new AbortController();

        async function fetchRecipe() {
            setLoading(true);
            setError("");
            setRecipe(null);

            try {
                if (!/^[1-9]\d*$/.test(id)) {
                    throw new Error(
                        "Neteisingas recepto numeris"
                    );
                }

                const response = await fetch(
                    `https://dummyjson.com/recipes/${id}`,
                    { signal: controller.signal }
                );

                if (response.status === 404) {
                    throw new Error("Receptas nerastas");
                }

                if (!response.ok) {
                    throw new Error(
                        "Nepavyko gauti recepto informacijos"
                    );
                }

                const data = await response.json();

                if (
                    !data.name ||
                    !Array.isArray(data.ingredients) ||
                    !Array.isArray(data.instructions)
                ) {
                    throw new Error(
                        "Gauti netinkami recepto duomenys"
                    );
                }

                if (!controller.signal.aborted) {
                    setRecipe(data);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(
                        err.message ||
                        "Nepavyko gauti recepto informacijos"
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchRecipe();

        return () => controller.abort();
    }, [id]);

    if (loading) {
        return (
            <main>
                <p>Kraunama recepto informacija</p>
            </main>
        );
    }

    if (error || !recipe) {
        return (
            <main>
                <Link className="back-link" to={backUrl}>
                    {backText}
                </Link>

                <p role="alert">
                    {error || "Receptas nerastas"}
                </p>
            </main>
        );
    }

    const favorite = isFavorite(recipe.id);
    const pending = isPending(recipe.id);

    return (
        <main className="recipe-detail">
            <Link className="back-link" to={backUrl}>
                {backText}
            </Link>

            <h1>{recipe.name}</h1>

            <div className="detail-actions">
                <button
                    type="button"
                    className={
                        favorite
                            ? "favorite-button active"
                            : "favorite-button"
                    }
                    disabled={!favoritesReady || pending}
                    aria-pressed={favorite}
                    onClick={() => toggleFavorite(recipe)}
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

            {favoritesError && (
                <div className="error-message">
                    <p role="alert">{favoritesError}</p>

                    <button
                        type="button"
                        onClick={reloadFavorites}
                    >
                        Atnaujinti mėgstamiausių būseną
                    </button>
                </div>
            )}

            <div className="recipe-detail-layout">
                <div>
                    <img
                        className="recipe-detail-image"
                        src={recipe.image}
                        alt={recipe.name}
                    />
                </div>

                <div className="recipe-info">
                    <h2>Recepto informacija</h2>

                    <p>
                        <strong>Virtuvė:</strong>{" "}
                        {recipe.cuisine}
                    </p>

                    <p>
                        <strong>Sudėtingumas:</strong>{" "}
                        {recipe.difficulty}
                    </p>

                    <p>
                        <strong>Paruošimo laikas:</strong>{" "}
                        {recipe.prepTimeMinutes} min
                    </p>

                    <p>
                        <strong>Gaminimo laikas:</strong>{" "}
                        {recipe.cookTimeMinutes} min
                    </p>

                    <p>
                        <strong>Bendras laikas:</strong>{" "}
                        {recipe.prepTimeMinutes +
                            recipe.cookTimeMinutes} min
                    </p>

                    <p>
                        <strong>Porcijų skaičius:</strong>{" "}
                        {recipe.servings}
                    </p>

                    <p>
                        <strong>Kalorijos porcijoje:</strong>{" "}
                        {recipe.caloriesPerServing} kcal
                    </p>

                    <p>
                        <strong>Įvertinimas:</strong>{" "}
                        {recipe.rating}/5
                    </p>
                </div>
            </div>

            <section className="recipe-section">
                <h2>Ingredientai</h2>

                <ul className="ingredients-list">
                    {recipe.ingredients.map(
                        (ingredient, index) => (
                            <li key={index}>
                                {ingredient}
                            </li>
                        )
                    )}
                </ul>
            </section>

            <section className="recipe-section">
                <h2>Gaminimo eiga</h2>

                <ol className="instructions-list">
                    {recipe.instructions.map(
                        (instruction, index) => (
                            <li key={index}>
                                {instruction}
                            </li>
                        )
                    )}
                </ol>
            </section>

            <Link className="back-link" to={backUrl}>
                {backText}
            </Link>
        </main>
    );
}
