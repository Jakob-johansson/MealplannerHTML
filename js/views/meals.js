function renderMeals() {
    const app = document.getElementById("app");

    if (state.meals.length === 0) {
        app.innerHTML = `
            <h1 class="view-title">Måltider</h1>
            <p class="empty-message">Inga måltider sparade. Lägg till från Hem-vyn.</p>
        `;
        return;
    }

    app.innerHTML = `
        <h1 class="view-title">Måltider</h1>
        <div class="meal-list">
            ${state.meals.map(meal => renderMealCard(meal)).join("")}
        </div>
    `;
}

function renderMealCard(meal) {
    const totalCalories = meal.ingredients.reduce((sum, i) => sum + i.calories, 0);
    const totalProtein  = meal.ingredients.reduce((sum, i) => sum + i.protein, 0);

    return `
        <div class="meal-card">
            <div class="meal-card-header" onclick="toggleMealCard(this)">
                <span class="meal-card-name">${meal.name}</span>
                <span class="meal-card-summary">${totalCalories} kcal · ${totalProtein}g Protein</span>
            </div>
            <div class="meal-card-ingredients hidden">
                ${meal.ingredients.map(ing => `
                    <div class="ingredient-row">
                        <span class="ingredient-name">${ing.name}</span>
                        <span class="ingredient-stats">
                            ${ing.calories} kcal · ${ing.protein}g Protein · ${ing.fat}g Fett · ${ing.carbs}g Kolhydrater
                        </span>
                    </div>
                `).join("")}
                <div class="meal-card-actions">
                    <button class="edit-btn" onclick="editMeal('${meal.id}')">Redigera</button>
                    <button class="delete-btn" onclick="deleteMeal('${meal.id}')">Ta bort</button>
                </div>
            </div>
        </div>
    `;
}

function toggleMealCard(header) {
    const ingredients = header.nextElementSibling;
    ingredients.classList.toggle("hidden");
}

function deleteMeal(mealId){
    const confirmed = confirm("Ta bort denna måltid?");
    if (!confirmed)  return;
    state.meals = state.meals.filter(m => m.id !== mealId);
    state.days.forEach(day => {
        if(day.slots.breakfast  === mealId) day.slots.breakfast = null;
        if(day.slots.lunch === mealId) day.slots.lunch = null;
        if(day.slots.dinner === mealId) day.slots.dinner = null;
        day.slots.snacks = Array.isArray(day.slots.snacks) 
        ? day.slots.snacks.filter(id => id !== mealId) 
        : [];
    });

    storage.save(state);
    renderMeals();
}
function editMeal(mealId){
    const meal = state.meals.find(m => m.id === mealId);
    if(!meal) return;

    currentDate = null;
    currentSlot = meal.type;
    currentIngredients = [...meal.ingredients];

    const app = document.getElementById("app");
    app.innerHTML =`
        <button class="back-btn" onclick="renderMeals()">Tillbaka</button>
        <h1 class="view-title">Redigera måltid</h1>

        <div class="form-group">
            <label class="form-label">Måltidsnamn</label>
            <input class="form-input" id="meal-name-input" 
                   type="text" value="${meal.name}">
        </div>

        <div class="form-group">
            <label class="form-label">Lägg till ingridienser</label>
            <div class="search-row">
                <input class="form-input" id="ingredient-input" 
                       type="text" placeholder="T.ex Kyckling">
                <button class="search-btn" onclick="searchIngredient()">Sök</button>
            </div>
            <p id="search-error" class="error-text"></p>
        </div>

        <div id="ingredient-list"></div>

        <button class="save-btn" onclick="updateMeal('${mealId}')">Spara ändringar</button>
    `;
    initAutocomplete("ingredient-input");
    renderIngredientList();

}

function updateMeal(mealId){
    const nameInput = document.getElementById("meal-name-input");
    const error = document.getElementById("search-error");
    const name = nameInput.value.trim();

    if(!name){
        error.textContent = "Ge måltiden ett namn";
        return;
    }

    if(currentIngredients.length === 0){
        error.textContent = "Lägg till minst 1 måltid."
    }

    const meal = state.meals.find(m => m.id === mealId);
    if(!meal) return;

    meal.name = name;
    meal.ingredients = currentIngredients;

    storage.save(state);
    renderMeals();




}
