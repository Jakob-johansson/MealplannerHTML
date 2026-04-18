const routes = {
    home: () => renderHome(),
    calendar: () => renderCalendar(),
    meals: () => renderMeals(),
    planner: () => renderPlanner()  
};

let currentRoute = "home";

function navigate(route){
    currentRoute = route;

    const app = document.getElementById("app");
    app.innerHTML = "";

    routes[route]();
    updateNavBar(route);
}