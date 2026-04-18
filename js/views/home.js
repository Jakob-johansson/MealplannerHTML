

function renderHome() {
    const app = document.getElementById("app");

    const today    = getTodayString();
    const tomorrow = getTomorrowString();

    app.innerHTML = `
        <h1 class="view-title">Hem</h1>
        ${renderDaySection(today,    "Idag")}
        ${renderDaySection(tomorrow, "Imorgon")}
    `;
}

function getTodayString() {
    return new Date().toISOString().slice(0, 10);
}

function getTomorrowString() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
}

function renderDaySection(dateString, label) {
    const day = state.days.find(d => d.date === dateString);
    const totals = calculateDayTotals(day);
  const hasData = day && (
    day.slots.breakfast ||
    day.slots.lunch ||
    day.slots.dinner ||
    (Array.isArray(day.slots.snacks) && day.slots.snacks.length > 0)
);

    return `
        <section class="day-section">
            <h2 class="day-title">${label}</h2>
            ${hasData ? renderDaySummary(totals) : ""}
            <div class="slots">
                ${renderSlot(day, "breakfast", "Frukost", dateString)}
                ${renderSlot(day, "lunch",     "Lunch",     dateString)}
                ${renderSlot(day, "dinner",    "Middag",    dateString)}
                ${renderSlot(day, "snacks",    "Snacks",    dateString)}
            </div>
        </section>
    `;
}

function renderDaySummary(totals) {
    return `
        <div class="day-summary">
            <div class="summary-item">
                <strong>${totals.calories}</strong>
                <span>kcal</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
                <strong>${totals.protein}g</strong>
                <span>Protein</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
                <strong>${totals.fat}g</strong>
                <span>Fett</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-item">
                <strong>${totals.carbs}g</strong>
                <span>Kolhydrater</span>
            </div>
        </div>
    `;
}

function renderSlot(day, slotType, slotLabel, dateString) {
    const mealId = day ? day.slots[slotType] : null;
    const meal = mealId ? state.meals.find(m => m.id === mealId) : null;

    if (meal) {
        return `
            <div class="slot filled">
                <div class="slot-info">
                    <span class="slot-label">${slotLabel}</span>
                    <span class="slot-meal">${meal.name}</span>
                </div>
                <button class="slot-remove-btn" 
                        onclick="removeMealFromSlot('${dateString}', '${slotType}')">
                    Ta bort
                </button>
            </div>
        `;
    }

    return `
        <div class="slot empty" 
             data-date="${dateString}" 
             data-slot="${slotType}"
             onclick="openAddMeal(this)">
            <span class="slot-label">${slotLabel}</span>
            <span class="slot-add">+ Lägg till</span>
        </div>
    `;
}

function removeMealFromSlot(dateString, slotType) {
    const day = state.days.find(d => d.date === dateString);
    if (!day) return;

    day.slots[slotType] = null;

    storage.save(state);
    renderHome();
}

function calculateDayTotals(day) {
    const totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    if (!day) return totals;

    const allSlots = [
    day.slots.breakfast,
    day.slots.lunch,
    day.slots.dinner,
    ...(Array.isArray(day.slots.snacks) ? day.slots.snacks : [])
].filter(id => id !== null);

    allSlots.forEach(mealId => {
        const meal = state.meals.find(m => m.id === mealId);
        if (!meal) return;

        meal.ingredients.forEach(ing => {
            totals.calories += ing.calories;
            totals.protein  += ing.protein;
            totals.fat      += ing.fat;
            totals.carbs    += ing.carbs;
        });
    });

    return totals;
}