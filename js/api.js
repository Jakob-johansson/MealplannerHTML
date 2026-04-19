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
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=25&dataType=Foundation&api_key=${API_KEY}`
        );

        if (!response.ok) throw new Error("API error");

        const data = await response.json();

        if (!data.foods || data.foods.length === 0) return null;

        const cleanFoods = data.foods.filter(f => {
            const d = f.description?.toLowerCase() || "";

            return (
                !d.includes("baby") &&
                !d.includes("soup") &&
                !d.includes("sauce") &&
                !d.includes("gravy") &&
                !d.includes("restaurant") &&
                !d.includes("fast food")
            );
        });

        const ranked = rankAllResults(cleanFoods, query);

        return ranked.slice(0, 10).map(food => {
            if (!Array.isArray(food.foodNutrients)) return null;

            const get = (names, unit = null) => {
                if (!Array.isArray(names)) names = [names];

                const n = food.foodNutrients.find(x =>
                    names.includes(x.nutrientName) &&
                    (!unit || x.unitName === unit)
                );

                return n ? Math.round(n.value) : 0;
            };

            const calories = get(["Energy", "Energy (Atwater General Factors)"], "KCAL");
            const fat = get(["Total lipid (fat)"]);

            return {
                id: genId(),
                name: ingredientName,
                label: translateFoodLabel(food.description),
                calories: calories,
                protein: get(["Protein"]),
                fat: fat,
                fatPercent: calories ? Math.round((fat * 9 / calories) * 100) : 0,
                carbs: get(["Carbohydrate, by difference"]),
                amount: 100
            };
        }).filter(Boolean);

    } catch (error) {
        console.error("API error:", error);
        return null;
    }
}

function rankAllResults(foods, query) {
    const words = query.toLowerCase().split(" ").filter(w => w.length > 2);

    // 👉 FIX: undvik trasig scoring om query är för kort
    if (words.length === 0) return foods;

    return foods.map(f => {
        const d = f.description?.toLowerCase() || "";
        const nutrients = Array.isArray(f.foodNutrients) ? f.foodNutrients : [];

        let score = 0;

        let matchCount = 0;
        words.forEach(word => {
            if (d.includes(word)) {
                score += 10;
                matchCount++;
            }
        });

        if (matchCount === 0) score -= 100;
        if (matchCount === words.length) score += 20;

        if (words.includes("chicken") && !d.includes("chicken")) score -= 100;

        if (d.includes("lean")) score += 15;
        if (d.includes("extra lean")) score += 20;
        if (d.includes("low fat")) score += 15;

        if (d.includes("raw")) score += 8;

        if (d.includes("fried")) score -= 10;
        if (d.includes("cooked")) score -= 5;
        if (d.includes("roasted")) score -= 5;
        if (d.includes("breaded")) score -= 10;
        if (d.includes("flour")) score -= 15;
        if (d.includes("mix")) score -= 10;
        if (d.includes("flavored")) score -= 10;
        if (d.includes("restaurant")) score -= 8;
        if (d.includes("cracker")) score -= 15;
        if (d.includes("cake")) score -= 15;
        if (d.includes("snack")) score -= 15;

        const energyNutrient = nutrients.find(x =>
            x.nutrientName === "Energy" && x.unitName === "KCAL"
        );

        if (energyNutrient) {
            const kcal = energyNutrient.value;
            if (kcal > 400) score -= 20;
            if (kcal > 600) score -= 20;
            if (kcal >= 80 && kcal <= 300) score += 10;
        }

        const fatNutrient = nutrients.find(x =>
            x.nutrientName === "Total lipid (fat)"
        );

        if (fatNutrient) {
            const fat = fatNutrient.value;

            if (fat <= 5) score += 20;
            else if (fat <= 10) score += 10;
            else if (fat >= 20) score -= 20;
        }

        const percentMatch = d.match(/(\d+)\s?%/);
        if (percentMatch) {
            const percent = parseInt(percentMatch[1]);

            if (percent <= 5) score += 25;
            else if (percent <= 10) score += 15;
            else if (percent >= 20) score -= 20;
        }

        return { ...f, score };
    })
    .filter(f => f.score > -50)
    .sort((a, b) => b.score - a.score);
}