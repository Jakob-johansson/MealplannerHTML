function genId(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}



function createDay(date){
    return {
        id: genId(),
        date: date,
        slots: {
            breakfast: null,
            lunch: null,
            dinner: null,
            snacks: []
        }
    };
}

function createMeal(name, type){
    return{
        id: genId(),
        name: name,
        type: type,
        ingredients: []
    };
}
//test commit
const storage = {
    save(data) {
        localStorage.setItem("mealplanner", JSON.stringify(data));
    },
    load(){
        const saved = localStorage.getItem("mealplanner");
        return saved ? JSON.parse(saved) : {days: [], meals: [], meta: { version: 1}};
    }
}; 
let state = storage.load();