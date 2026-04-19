let currentDate = null;
let currentSlot = null;
let currentIngredients = [];
let lastSearchResults = null;

function showLastResults() {
    if (!lastSearchResults) return;
    const list = document.getElementById("ingredient-list");
    list.innerHTML = "";
    renderSearchResults(lastSearchResults);
}

function openAddMeal(slotElement) {
    currentDate = slotElement.dataset.date;
    currentSlot = slotElement.dataset.slot;
    currentIngredients = [];

    const app = document.getElementById("app");
    const hasSavedMeals = state.meals.length > 0;

    app.innerHTML = `
        <button class="back-btn" onclick="renderHome()">Tillbaka</button>
        <h1 class="view-title">Lägg till måltid</h1>

        ${hasSavedMeals ? `
        <div class="form-group">
            <label class="form-label">Välj från bibliotek</label>
            <div class="meal-picker">
                ${state.meals.map(meal => `
                    <div class="meal-picker-item" onclick="pickMealFromLibrary('${meal.id}')">
                        <span class="meal-picker-name">${meal.name}</span>
                        <span class="meal-picker-type">${meal.type}</span>
                    </div>
                `).join("")}
            </div>
        </div>
        <div class="divider-label">eller skapa ny</div>
        ` : ""}

        <div class="form-group">
            <label class="form-label">Måltidsnamn</label>
            <input class="form-input" id="meal-name-input" 
                   type="text" autocomplete="off"   autocorrect="off"   autocapitalize="off"   spellcheck="false" placeholder="T.ex kyckling och ris">
        </div>

        <div class="form-group">
            <label class="form-label">Lägg till ingrediens</label>
            <div class="search-row">
                <div class="input-wrapper">
                    <input class="form-input" id="ingredient-input" 
                           type="text" autocomplete="off"   autocorrect="off"   autocapitalize="off"   spellcheck="false" placeholder="T.ex kyckling">
                </div>
                <button class="search-btn" onclick="searchIngredient()">Sök</button>
            </div>
            <p id="search-error" class="error-text"></p>
        </div>

        <div id="ingredient-list"></div>

        <button class="save-btn" onclick="saveMeal()">Spara måltid</button>
    `;
    initAutocomplete("ingredient-input");
}

function pickMealFromLibrary(mealId) {
    const day = state.days.find(d => d.date === currentDate) || createDay(currentDate);

    if (!state.days.find(d => d.date === currentDate)) {
        state.days.push(day);
    }

    day.slots[currentSlot] = mealId;

    storage.save(state);
    renderHome();
}

async function searchIngredient() {
    const input = document.getElementById("ingredient-input");
    const error = document.getElementById("search-error");
    const name  = input.value.trim();

    if (!name) {
        error.textContent = "Lägg till en ingrediens först.";
        return;
    }

    error.textContent = "";
    const btn = document.querySelector(".search-btn");
    btn.textContent = "Söker...";
    btn.disabled = true;

    const results = await fetchNutrition(name);

    btn.textContent = "Sök";
    btn.disabled = false;

    if (!results || results.length === 0) {
        error.textContent = "Kunde inte hitta: " + name;
        return;
    }

    lastSearchResults = results;
    renderSearchResults(results);
    input.value = "";
}

function renderSearchResults(results) {
    const list = document.getElementById("ingredient-list");

    list.innerHTML = `
        <div class="search-results">
            <p class="search-results-label">Välj det bästa alternativet</p>
            ${results.map((r, index) => `
                <div class="search-result-item" onclick="selectIngredient(${index})"
                     data-index="${index}">
                    <span class="result-label">${r.label}</span>
                    <span class="result-stats">
                       ${r.calories} kcal · ${r.protein}g Protein · 
                       ${r.fat}g Fett (${r.fatPercent}% av kalorier) · ${r.carbs}g Kolhydrater
                        <em style="font-size:11px;color:#aaa"> per 100g</em>
                    </span>
                </div>
            `).join("")}
        </div>
    `;

    list._searchResults = results;
}

function selectIngredient(index) {
    const list = document.getElementById("ingredient-list");
    const results = list._searchResults;
    const selected = results[index];

    list.innerHTML = `
        <div class="amount-picker">
            <p class="search-results-label">
                <strong>${selected.label}</strong>
            </p>
            <p class="per-100g">
                Per 100g: ${selected.calories} kcal · 
                ${selected.protein}g Protein · 
                ${selected.fat}g Fett (${selected.fatPercent}%)
                ${selected.carbs}g Kolhydrater
            </p>
            <div class="amount-row">
                <label class="form-label">Mängd (gram)</label>
                <input class="form-input amount-input" 
                       id="amount-input" 
                       type="number" 
                       autocomplete="off"   
                       autocorrect="off"   
                       autocapitalize="off"   
                       spellcheck="false"
                       value="100" 
                       min="1"
                       oninput="updateNutritionPreview(${index})">
            </div>
            <div class="nutrition-preview" id="nutrition-preview">
                ${renderNutritionPreview(selected, 100)}
            </div>
            <div class="amount-actions">
                <button class="back-search-btn" onclick="showLastResults()">
                    Tillbaka till resultat
                </button>
                <button class="confirm-btn" onclick="confirmIngredient(${index})">
                    Lägg till ingrediens
                </button>
            </div>
        </div>
    `;

    list._searchResults = results;
}

function renderNutritionPreview(ingredient, amount) {
    const factor = amount / 100;
    return `
        <div class="preview-grid">
            <div class="preview-item">
                <strong>${Math.round(ingredient.calories * factor)}</strong>
                <span>kcal</span>
            </div>
            <div class="preview-item">
                <strong>${Math.round(ingredient.protein * factor)}g</strong>
                <span>Protein</span>
            </div>
            <div class="preview-item">
                <strong>${Math.round(ingredient.fat * factor)}g</strong>
                <span>Fett</span>
            </div>
            <div class="preview-item">
                <strong>${Math.round(ingredient.carbs * factor)}g</strong>
                <span>Kolhydrater</span>
            </div>
        </div>
    `;
}

function updateNutritionPreview(index) {
    const list    = document.getElementById("ingredient-list");
    const results = list._searchResults;
    const amount  = parseFloat(document.getElementById("amount-input").value) || 0;
    const preview = document.getElementById("nutrition-preview");

    preview.innerHTML = renderNutritionPreview(results[index], amount);
}

function confirmIngredient(index) {
    const list    = document.getElementById("ingredient-list");
    const results = list._searchResults;
    const base    = results[index];
    const amount  = parseFloat(document.getElementById("amount-input").value) || 100;
    const factor  = amount / 100;

    const ingredient = {
        id:       genId(),
        name:     base.name,
        label:    base.label,
        calories: Math.round(base.calories * factor),
        protein:  Math.round(base.protein  * factor),
        fat:      Math.round(base.fat      * factor),
        carbs:    Math.round(base.carbs    * factor),
        amount:   amount
    };

    currentIngredients.push(ingredient);

    list.innerHTML = "";
    list._searchResults = null;

    renderIngredientList();
}

function renderIngredientList() {
    const list = document.getElementById("ingredient-list");
    if (!list) return;

    if (currentIngredients.length === 0) {
        list.innerHTML = "";
        return;
    }

    list.innerHTML = currentIngredients.map((ing, index) => `
        <div class="ingredient-row">
            <div>
                <span class="ingredient-name">${ing.name}</span>
                <span class="ingredient-amount">${ing.amount}g</span>
            </div>
            <span class="ingredient-stats">
                ${ing.calories} kcal · ${ing.protein}g Protein
            </span>
            <button class="remove-btn" onclick="removeIngredient(${index})">Ta bort</button>
        </div>
    `).join("");
}

function removeIngredient(index) {
    currentIngredients.splice(index, 1);
    renderIngredientList();
}

function saveMeal() {
    const nameInput = document.getElementById("meal-name-input");
    const error = document.getElementById("search-error");
    const name = nameInput.value.trim();

    if (!name) {
        error.textContent = "Ge måltiden ett namn.";
        return;
    }

    if (currentIngredients.length === 0) {
        error.textContent = "Lägg till minst en ingrediens.";
        return;
    }

    const meal = createMeal(name, currentSlot);
    meal.ingredients = currentIngredients;

    state.meals.push(meal);

    let day = state.days.find(d => d.date === currentDate);
    if (!day) {
        day = createDay(currentDate);
        state.days.push(day);
    }

    day.slots[currentSlot] = meal.id;

    storage.save(state);
    renderHome();
}
