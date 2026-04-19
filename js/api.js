// js/api.js

const API_KEY = CONFIG.USDA_API_KEY;



function translateIngredient(input) {
    const lower = input.toLowerCase().trim();

    
    if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];

    for (const key of Object.keys(TRANSLATIONS)) {
        if (lower.includes(key)) return TRANSLATIONS[key];
    }

    return input;
}

async function fetchNutrition(ingredientName) {
    const query = translateIngredient(ingredientName);

    try {
        const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=25&dataType=SR%20Legacy&api_key=${API_KEY}`
        );
        const data = await response.json();

        if (!data.foods || data.foods.length === 0) return null;

        const ranked = rankAllResults(data.foods, query);

      return ranked.slice(0, 10).map(food => {
    const get = (name) => {
        const n = food.foodNutrients.find(x => x.nutrientName === name);
        
        return n ? Math.round(n.value) : 0;
    };

           return {
                id:       genId(),
                name:     ingredientName,
                label:    translateFoodLabel(food.description),
                calories: get("Energy"),
                protein:  get("Protein"),
                fat:      get("Total lipid (fat)"),
                carbs:    get("Carbohydrate, by difference"),
                amount:   100
            };
        });

    } catch (error) {
        console.error("API error:", error);
        return null;
    }
}

function rankAllResults(foods, query) {
    return foods.map(f => {
        const d = f.description.toLowerCase();
        let score = 0;

        query.split(" ").forEach(word => {
            if (word.length > 2 && d.includes(word)) score += 10;
        });

        // Bonus: råvaror
        if (d.includes("raw"))        score += 8;

        // Straff: tillagat eller processat
        if (d.includes("fried"))      score -= 10;
        if (d.includes("cooked"))     score -= 5;
        if (d.includes("roasted"))    score -= 5;
        if (d.includes("breaded"))    score -= 10;
        if (d.includes("flour"))      score -= 15;
        if (d.includes("mix"))        score -= 10;
        if (d.includes("flavored"))   score -= 10;
        if (d.includes("restaurant")) score -= 8;
        if (d.includes("cracker"))    score -= 15;
        if (d.includes("cake"))       score -= 15;
        if (d.includes("snack"))      score -= 15;

        // Straff: onaturligt höga kalorier per 100g
        const energyNutrient = f.foodNutrients.find(x => x.nutrientName === "Energy" && x.unitName === "KCAL");
        if (energyNutrient) {
            const kcal = energyNutrient.value;
            if (kcal > 400) score -= 20;
            if (kcal > 600) score -= 20;
        }

        // Bonus: rimliga kalorier för kött (100-250 kcal)
        if (energyNutrient) {
            const kcal = energyNutrient.value;
            if (kcal >= 80 && kcal <= 300) score += 10;
        }

        return { ...f, score };
    }).sort((a, b) => b.score - a.score);
}