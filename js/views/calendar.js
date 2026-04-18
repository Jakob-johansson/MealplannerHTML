

let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();

function renderCalendar() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <h1 class="view-title">Kalender</h1>
        <div class="calendar-nav">
            <button class="cal-nav-btn" onclick="changeMonth(-1)">&#8592;</button>
            <span class="cal-month-label">${getMonthLabel()}</span>
            <button class="cal-nav-btn" onclick="changeMonth(1)">&#8594;</button>
        </div>
        <div class="calendar-grid">
            <div class="cal-weekday">Mån</div>
            <div class="cal-weekday">Tis</div>
            <div class="cal-weekday">Ons</div>
            <div class="cal-weekday">Tors</div>
            <div class="cal-weekday">Fre</div>
            <div class="cal-weekday">Lör</div>
            <div class="cal-weekday">Sön</div>
            ${renderCalendarDays()}
        </div>
    `;
}

function getMonthLabel() {
    const months = [
        "Januari", "Februari", "Mars", "April",
    "Maj", "Juni", "Juli", "Augusti",
    "September", "Oktober", "November", "December"
    ];
    return `${months[currentMonth]} ${currentYear}`;
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) { currentMonth = 0;  currentYear++; }
    if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
    renderCalendar();
}

function renderCalendarDays() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date().toISOString().slice(0, 10);

    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    let html = "";

    for (let i = 0; i < startOffset; i++) {
        html += `<div class="cal-day empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const hasData = state.days.some(day => day.date === dateString);
        const isToday = dateString === today;

        html += `
            <div class="cal-day ${hasData ? "has-data" : ""} ${isToday ? "is-today" : ""}"
                 onclick="openCalendarDay('${dateString}')">
                <span class="cal-day-number">${d}</span>
                ${hasData ? `<span class="cal-dot"></span>` : ""}
            </div>
        `;
    }

    return html;
}
function openCalendarDay(dateString) {
    const app = document.getElementById("app");
    const day = state.days.find(d => d.date === dateString);
    const totals = calculateDayTotals(day);
    const hasData = day && (
        day.slots.breakfast ||
        day.slots.lunch ||
        day.slots.dinner ||
       (Array.isArray(day.slots.snacks) && day.slots.snacks.length > 0)
    );

    const label = formatDateLabel(dateString);

    app.innerHTML = `
        <button class="back-btn" onclick="renderCalendar()">Tillbaka</button>
        <h1 class="view-title">${label}</h1>
        ${hasData ? renderDaySummary(totals) : ""}
        <div class="slots">
            ${renderSlot(day, "breakfast", "Frukost", dateString)}
            ${renderSlot(day, "lunch",     "Lunch",     dateString)}
            ${renderSlot(day, "dinner",    "Middag",    dateString)}
            ${renderSlot(day, "snacks",    "Snacks",    dateString)}
        </div>
    `;
}

function formatDateLabel(dateString) {
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}