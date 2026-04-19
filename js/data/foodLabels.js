const FOOD_LABELS = {
    // Kyckling
    "chicken breast, raw":                      "Kycklingbröst, rått",
    "chicken thigh, raw":                       "Kycklinglår, rått",
    "chicken, broilers or fryers, breast, raw": "Kycklingbröst, rått",
    "chicken, broilers or fryers, thigh, raw":  "Kycklinglår, rått",
    "chicken, broilers or fryers, leg, raw":    "Kycklingben, rått",
    "chicken, broilers or fryers, wing, raw":   "Kycklingvinge, rått",

    // Nötkött
    "beef, ground, raw":                        "Nötfärs, rå",
    "beef, tenderloin, raw":                    "Oxfilé, rå",
    "beef, ribeye steak, raw":                  "Entrecôte, rå",
    "beef, top sirloin, raw":                   "Nötbiff, rå",
    "beef, stew meat, raw":                     "Grytbitar nöt, råa",

    // Fläsk
    "pork, ground, raw":                        "Fläskfärs, rå",
    "pork, tenderloin, raw":                    "Fläskfilé, rå",
    "pork, chop, raw":                          "Fläskkotlett, rå",
    "pork, belly, raw":                         "Sidfläsk, rått",
    "pork, sausage, raw":                       "Korv, rå",

    // Fisk
    "salmon, raw":                              "Lax, rå",
    "cod, raw":                                 "Torsk, rå",
    "tuna, canned in water":                    "Tonfisk, konserverad i vatten",
    "mackerel, raw":                            "Makrill, rå",
    "herring, raw":                             "Sill, rå",
    "shrimp, raw":                              "Räkor, råa",

    // Mejeri
    "milk, whole":                              "Mjölk, hel",
    "milk, low fat":                            "Lättmjölk",
    "butter":                                   "Smör",
    "cheese, cheddar":                          "Ost, cheddar",
    "cheese, mozzarella":                       "Mozzarella",
    "cheese, parmesan":                         "Parmesan",
    "yogurt, plain, whole milk":                "Yoghurt, naturell",
    "yogurt, greek, plain":                     "Grekisk yoghurt",
    "cream, heavy":                             "Grädde 40%",
    "sour cream":                               "Gräddfil",
    "egg, whole, raw":                          "Ägg, helt, rått",
    "egg white, raw":                           "Äggvita, rå",

    // Spannmål
    "rice, white, raw":                         "Vitt ris, rått",
    "rice, brown, raw":                         "Råris, rått",
    "pasta, dry":                               "Pasta, torr",
    "spaghetti, dry":                           "Spaghetti, torr",
    "oats, rolled, raw":                        "Havregryn, råa",
    "bread, white":                             "Vitt bröd",
    "bread, whole wheat":                       "Grovbröd",
    "flour, all purpose":                       "Vetemjöl",
    "tortilla, flour":                          "Mjöltortilla",

    // Grönsaker
    "tomato, raw":                              "Tomat, rå",
    "onion, raw":                               "Lök, rå",
    "garlic, raw":                              "Vitlök, rå",
    "potato, raw":                              "Potatis, rå",
    "sweet potato, raw":                        "Sötpotatis, rå",
    "broccoli, raw":                            "Broccoli, rå",
    "carrot, raw":                              "Morot, rå",
    "cucumber, raw":                            "Gurka, rå",
    "lettuce, raw":                             "Sallad, rå",
    "spinach, raw":                             "Spenat, rå",
    "bell pepper, raw":                         "Paprika, rå",
    "mushroom, raw":                            "Champinjoner, råa",
    "avocado, raw":                             "Avokado, rå",

    // Frukt
    "banana, raw":                              "Banan, rå",
    "apple, raw":                               "Äpple, rått",
    "strawberries, raw":                        "Jordgubbar, råa",
    "blueberries, raw":                         "Blåbär, råa",

    // Oljor
    "olive oil":                                "Olivolja",
    "canola oil":                               "Rapsolja",

    // Övrigt
    "peanut butter":                            "Jordnötssmör",
    "honey":                                    "Honung",
    "sugar, white":                             "Socker",
    "dark chocolate":                           "Mörk choklad",
    "tofu, firm":                               "Tofu, fast"
};

function translateFoodLabel(englishLabel) {
    const lower = englishLabel.toLowerCase();

    if (FOOD_LABELS[lower]) return FOOD_LABELS[lower];

    for (const key of Object.keys(FOOD_LABELS)) {
        if (lower.includes(key)) return FOOD_LABELS[key];
    }

    return englishLabel;
}