function init(){
    renderNavBar();
    navigate("home");
}

//Kollar så HTML sidan är laddad innan programmet försöker hitta app.js
document.addEventListener("DOMContentLoaded", init);
