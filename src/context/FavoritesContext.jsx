
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);
const API_URL = "http://localhost:3001/favorites";

function initialState() {
    return {
        userId: null,
        records: [],
        loading: false,
        ready: false,
        error: ""
    };
}

export function FavoritesProvider({ children }) {
    const { user } = useAuth();
    const userId = user ? String(user.id) : null;

    const [storage, setStorage] = useState(initialState);
    const [pendingKeys, setPendingKeys] = useState([]);
    const [reloadKey, setReloadKey] = useState(0);

    const pendingRef = useRef(new Set());

    useEffect(() => {
        const controller = new AbortController();

        if (!userId) {
            setStorage(initialState());
            return () => controller.abort();
        }

        setStorage({
            userId,
            records: [],
            loading: true,
            ready: false,
            error: ""
        });

        async function loadFavorites() {
            try {
                const response = await fetch(
                    `${API_URL}?userId=${encodeURIComponent(userId)}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error(
                        "Nepavyko įkelti mėgstamiausių receptų"
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error(
                        "Gauti netinkami mėgstamiausių duomenys"
                    );
                }

                const unique = new Map();

                data.forEach((item) => {
                    if (String(item.userId) !== userId) {
                        return;
                    }

                    const recipeId = Number(item.recipeId);

                    if (
                        Number.isSafeInteger(recipeId) &&
                        recipeId > 0 &&
                        !unique.has(recipeId)
                    ) {
                        unique.set(recipeId, item);
                    }
                });

                if (!controller.signal.aborted) {
                    setStorage({
                        userId,
                        records: [...unique.values()],
                        loading: false,
                        ready: true,
                        error: ""
                    });
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setStorage({
                        userId,
                        records: [],
                        loading: false,
                        ready: false,
                        error:
                            err.message ||
                            "Nepavyko įkelti mėgstamiausių receptų"
                    });
                }
            }
        }

        loadFavorites();

        return () => controller.abort();
    }, [userId, reloadKey]);

    const currentStorage =
        storage.userId === userId ? storage : null;

    const favorites = currentStorage?.records ?? [];

    const favoritesLoading =
        Boolean(userId) &&
        (!currentStorage || currentStorage.loading);

    const favoritesReady =
        Boolean(userId) &&
        currentStorage?.ready === true;

    const favoritesError = currentStorage?.error ?? "";

    function isFavorite(recipeId) {
        return favorites.some(
            (item) =>
                Number(item.recipeId) === Number(recipeId)
        );
    }

    function isPending(recipeId) {
        return pendingKeys.includes(
            `${userId}:${Number(recipeId)}`
        );
    }

    function reloadFavorites() {
        if (pendingRef.current.size === 0) {
            setReloadKey((previous) => previous + 1);
        }
    }

    async function toggleFavorite(recipe) {
        if (!recipe) {
            return false;
        }

        const recipeId = Number(recipe.id);

        if (
            !userId ||
            !favoritesReady ||
            !Number.isSafeInteger(recipeId) ||
            recipeId < 1
        ) {
            return false;
        }

        const key = `${userId}:${recipeId}`;

        if (pendingRef.current.has(key)) {
            return false;
        }

        const existing = favorites.find(
            (item) =>
                Number(item.recipeId) === recipeId
        );

        pendingRef.current.add(key);

        setPendingKeys((previous) => [
            ...previous,
            key
        ]);

        setStorage((current) =>
            current.userId === userId
                ? { ...current, error: "" }
                : current
        );

        try {
            if (existing) {
                const response = await fetch(
                    `${API_URL}/${encodeURIComponent(
                        String(existing.id)
                    )}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error(
                        "Nepavyko pašalinti recepto iš mėgstamiausių"
                    );
                }

                setStorage((current) =>
                    current.userId === userId
                        ? {
                            ...current,
                            records: current.records.filter(
                                (item) =>
                                    String(item.id) !==
                                    String(existing.id)
                            )
                        }
                        : current
                );
            } else {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId,
                        recipeId,
                        name: recipe.name,
                        image: recipe.image
                    })
                });

                if (!response.ok) {
                    throw new Error(
                        "Nepavyko išsaugoti mėgstamo recepto"
                    );
                }

                const saved = await response.json();

                if (
                    saved.id === undefined ||
                    saved.id === null
                ) {
                    throw new Error(
                        "Serveris negrąžino mėgstamiausio įrašo ID"
                    );
                }

                setStorage((current) => {
                    if (current.userId !== userId) {
                        return current;
                    }

                    const alreadyExists =
                        current.records.some(
                            (item) =>
                                Number(item.recipeId) === recipeId
                        );

                    if (alreadyExists) {
                        return current;
                    }

                    return {
                        ...current,
                        records: [
                            ...current.records,
                            saved
                        ]
                    };
                });
            }

            return true;
        } catch (err) {
            setStorage((current) =>
                current.userId === userId
                    ? {
                        ...current,
                        error:
                            err.message ||
                            "Nepavyko pakeisti mėgstamiausių receptų"
                    }
                    : current
            );

            return false;
        } finally {
            pendingRef.current.delete(key);

            setPendingKeys((previous) =>
                previous.filter(
                    (item) => item !== key
                )
            );
        }
    }

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                favoritesLoading,
                favoritesReady,
                favoritesError,
                isFavorite,
                isPending,
                toggleFavorite,
                reloadFavorites
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);

    if (!context) {
        throw new Error("FavoritesProvider nerastas");
    }

    return context;
}
