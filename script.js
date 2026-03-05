const apiSection = document.getElementById("api");
const favoritesSection = document.getElementById("guardados");
const loader = document.getElementById("loader");
const randomBtn = document.getElementById("randomBtn");

let currentDrink = null;

/* =====================
   UTILIDADES
===================== */

function showLoader() {
  loader.style.display = "block";
  apiSection.innerHTML = "";
}

function hideLoader() {
  loader.style.display = "none";
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

/* =====================
   API CALLS
===================== */

function loadRandomCocktail() {
  showLoader();

  fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
    .then(res => res.json())
    .then(data => {
      if (!data.drinks) throw new Error("No results");
      renderDrink(data.drinks[0]);
    })
    .catch(() => {
      hideLoader();
      apiSection.innerHTML = "<p>Error al cargar el cóctel.</p>";
    });
}

function loadCocktailById(id) {
  showLoader();

  fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res => res.json())
    .then(data => {
      if (!data.drinks) throw new Error("No results");
      renderDrink(data.drinks[0]);
    })
    .catch(() => {
      hideLoader();
      apiSection.innerHTML = "<p>No se pudo cargar el detalle.</p>";
    });
}

/* =====================
   RENDER PRINCIPAL
===================== */

function renderDrink(drink) {
  currentDrink = drink;

  let ingredients = "";
  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ing) {
      ingredients += `<li>${measure ? measure : ""} ${ing}</li>`;
    }
  }

  hideLoader();

  apiSection.innerHTML = `
    <article class="cocktail">
      <h2>${drink.strDrink}</h2>
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
      <p><strong>ID:</strong> ${drink.idDrink}</p>
      <p><strong>Categoría:</strong> ${drink.strCategory}</p>
      <p><strong>Preparación:</strong> ${drink.strInstructions}</p>

      <h3>Ingredientes</h3>
      <ul>${ingredients}</ul>

      <button id="favBtn">
        ${isFavorite(drink.idDrink) ? "❌ Eliminar de favoritos" : "⭐ Guardar en favoritos"}
      </button>
    </article>
  `;

  document.getElementById("favBtn").onclick = toggleFavorite;
}

/* =====================
   FAVORITOS
===================== */

function isFavorite(id) {
  return getFavorites().some(f => f.id === id);
}

function toggleFavorite() {
  if (!currentDrink) return;

  let favorites = getFavorites();
  const index = favorites.findIndex(f => f.id === currentDrink.idDrink);

  if (index === -1) {
    // guardar SOLO id y nombre
    favorites.push({
      id: currentDrink.idDrink,
      nombre: currentDrink.strDrink
    });
  } else {
    favorites.splice(index, 1);
  }

  saveFavorites(favorites);
  renderFavorites();
  renderDrink(currentDrink); // refresca botón
}

function renderFavorites() {
  const favorites = getFavorites();

  if (favorites.length === 0) {
    favoritesSection.innerHTML = "<p>No hay favoritos guardados ⭐</p>";
    return;
  }

  favoritesSection.innerHTML = `
    <ul class="favorites">
      ${favorites
        .map(
          f => `
          <li>
            <button onclick="loadCocktailById('${f.id}')">
              ${f.nombre}
            </button>
          </li>
        `
        )
        .join("")}
    </ul>
  `;
}

/* =====================
   EVENTOS / INIT
===================== */

// criterio 1: carga automática
loadRandomCocktail();

// criterio 2: opción dedicada
randomBtn.addEventListener("click", loadRandomCocktail);

// render favoritos al inicio
renderFavorites();