const apiSection = document.getElementById("api");
const favoritesSection = document.getElementById("guardados");
const loader = document.getElementById("loader");

let currentDrink = null;

function showLoader() {
  loader.style.display = "block";
  apiSection.innerHTML = `
    <article class="cocktail">
      <h2>Cargando</h2>
      <img src="img/loading.gif">
    </article>
  `;
}

function hideLoader() {
  loader.style.display = "none";
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) ?? [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

// ! API calls

// ? Renderizar un coctel random
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
      apiSection.innerHTML = "<p>Error al cargar el coctel.</p>";
    });
}

// ? Renderizar un coctel guardado
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

// ! Crear la plantilla de la bebida
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
      <img src="${drink.strDrinkThumb}">
      <p><strong>ID:</strong> ${drink.idDrink}</p>
      <p><strong>Categoría:</strong> ${drink.strCategory}</p>
      <p><strong>Preparación:</strong> ${drink.strInstructions}</p>

      <h3>Ingredientes</h3>
      <ul>${ingredients}</ul>
      <section>
        <button id="favBtn">
          ${isFavorite(drink.idDrink) ? "Eliminar de favoritos" : "Guardar en favoritos"}
        </button>
        <button id="randomBtn">Refrescar</button>
      </section>
    </article>
  `;
  document.getElementById("randomBtn").onclick = loadRandomCocktail;
  document.getElementById("favBtn").onclick = toggleFavorite;
}



function isFavorite(id) {
  return getFavorites().some(f => f.id === id);
}

function toggleFavorite() {
  if (!currentDrink) return;

  let favorites = getFavorites();
  const index = favorites.findIndex(f => f.id === currentDrink.idDrink);

  if (index === -1) {
    favorites.push({
      id: currentDrink.idDrink,
      nombre: currentDrink.strDrink
    });
  } else {
    favorites.splice(index, 1);
  }

  saveFavorites(favorites);
  renderFavorites();
  renderDrink(currentDrink);
}

function renderFavorites() {
  const favorites = getFavorites();

  if (favorites.length === 0) {
    favoritesSection.innerHTML = "<p>No hay favoritos guardados</p>";
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

loadRandomCocktail();

renderFavorites();