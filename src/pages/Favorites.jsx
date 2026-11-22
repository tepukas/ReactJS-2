
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

export default function Favorites() {
    const {
        favorites,
        favoritesLoading,
        favoritesReady,
        favoritesError,
        isPending,
        toggleFavorite,
        reloadFavorites
    } = useFavorites();

    return (
        <main>
            <h1>Mano mėgstamiausi receptai</h1>

            <p>Čia rasite visus išsaugotus receptus</p>

            {favoritesError && (
                <div className="error-message">
                    <p role="alert">{favoritesError}</p>

                    <button
                        type="button"
                        onClick={reloadFavorites}
                    >
                        Atnaujinti mėgstamiausių sąrašą
                    </button>
                </div>
            )}

            {favoritesLoading ? (
                <p>Kraunami mėgstamiausi receptai</p>
            ) : !favoritesReady ? (
                <p>
                    Mėgstamiausių receptų nepavyko įkelti
                </p>
            ) : favorites.length === 0 ? (
                <div className="empty-favorites">
                    <h2>Mėgstamiausių receptų dar nėra</h2>

                    <p>
                        Peržiūrėkite receptus ir išsaugokite
                        labiausiai patikusius
                    </p>

                    <Link
                        className="primary-link"
                        to="/recipes"
                    >
                        Peržiūrėti receptus
                    </Link>
                </div>
            ) : (
                <>
                    <p className="recipe-count">
                        Išsaugota receptų: {favorites.length}
                    </p>

                    <div className="recipe-list">
                        {favorites.map((favorite) => {
                            const pending = isPending(
                                favorite.recipeId
                            );

                            return (
                                <article
                                    className="recipe-card"
                                    key={favorite.id}
                                >
                                    <Link
                                        className="recipe-card-link"
                                        to={`/recipe/${favorite.recipeId}?from=favorites`}
                                    >
                                        <img
                                            src={favorite.image}
                                            alt={favorite.name}
                                            loading="lazy"
                                        />

                                        <div className="recipe-card-content">
                                            <h2>
                                                {favorite.name}
                                            </h2>

                                            <span className="recipe-more">
                                                Peržiūrėti receptą
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="recipe-favorite-action">
                                        <button
                                            type="button"
                                            className="favorite-button active"
                                            disabled={
                                                !favoritesReady ||
                                                pending
                                            }
                                            aria-pressed={true}
                                            onClick={() =>
                                                toggleFavorite({
                                                    id: favorite.recipeId,
                                                    name: favorite.name,
                                                    image: favorite.image
                                                })
                                            }
                                        >
                                            {pending
                                                ? "Šalinama"
                                                : "♥ Pašalinti iš mėgstamiausių"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </main>
    );
}
