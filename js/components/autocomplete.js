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

        const matches = suggestions
        .filter(s => s.includes(value))
        .sort((a, b) => {
            const aStarts = a.startsWith(value);
            const bStarts = b.startsWith(value);
            if(aStarts && !bStarts)return -1;
            if(!aStarts && bStarts) return 1;
            return a.localeCompare(b);
        })
        .slice(0, 20);

        if (matches.length === 0) {
            dropdown.classList.add("hidden");
            return;
        }

      dropdown.innerHTML = matches.map(match => `
            <div class="autocomplete-item" onclick="selectAndSearch('${match}', '${inputId}')">
                <span class="autocomplete-name">${highlightMatch(match, value)}</span>
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

function highlightMatch(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    return text.slice(0, index) +
        `<strong>${text.slice(index, index + query.length)}</strong>` +
        text.slice(index + query.length);
}

function selectAndSearch(value, inputId) {
    const input = document.getElementById(inputId);
    input.value = value;

    const dropdown = input.parentNode.querySelector(".autocomplete-dropdown");
    dropdown.classList.add("hidden");

    searchIngredient();
}

function selectSuggestion(value, inputId) {
    const input = document.getElementById(inputId);
    input.value = value;

    const dropdown = input.parentNode.querySelector(".autocomplete-dropdown");
    dropdown.classList.add("hidden");
}
