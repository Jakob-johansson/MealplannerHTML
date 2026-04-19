function initAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const wrapper = input.parentNode;
    wrapper.style.position = "relative";
    wrapper.style.flex = "1";

    const suggestions = Object.keys(TRANSLATIONS);

    const dropdown = document.createElement("div");
    dropdown.className = "autocomplete-dropdown hidden";
    wrapper.appendChild(dropdown);

    input.addEventListener("input", () => {
        const value = input.value.toLowerCase().trim();

        if (value.length < 2) {
            dropdown.classList.add("hidden");
            return;
        }

        const matches = suggestions.filter(s => s.startsWith(value)).slice(0, 6);

        if (matches.length === 0) {
            dropdown.classList.add("hidden");
            return;
        }

        dropdown.innerHTML = matches.map(match => `
            <div class="autocomplete-item" onclick="selectSuggestion('${match}', '${inputId}')">
                ${match}
            </div>
        `).join("");

        dropdown.classList.remove("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });
}

function selectSuggestion(value, inputId) {
    const input = document.getElementById(inputId);
    input.value = value;

    const dropdown = input.parentNode.querySelector(".autocomplete-dropdown");
    dropdown.classList.add("hidden");
}