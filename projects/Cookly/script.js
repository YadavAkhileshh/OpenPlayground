const searchInput = document.getElementById("globalSearch");
const container = document.getElementById("recipesContainer");

// Modal Elements
const modal = document.getElementById("recipeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalInstructions = document.getElementById("modalInstructions");
const closeBtn = document.querySelector(".close");

// Fetch Recipes
async function fetchRecipes(query="chicken"){
  if(!container) return;

  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await res.json();

  container.innerHTML="";

  if(data.meals){
    data.meals.forEach(meal=>{
      const div=document.createElement("div");
      div.classList.add("card");
      div.innerHTML=`
        <img src="${meal.strMealThumb}">
        <h3 style="padding:15px">${meal.strMeal}</h3>
      `;

      div.addEventListener("click",()=>{
        modal.style.display="flex";
        modalImg.src = meal.strMealThumb;
        modalTitle.textContent = meal.strMeal;
        modalCategory.textContent = "Category: " + meal.strCategory;
        modalInstructions.textContent = meal.strInstructions;
      });

      container.appendChild(div);
    });
  }

  // Load user-added recipes from localStorage
  let recipes=JSON.parse(localStorage.getItem("myRecipes"))||[];
  recipes.forEach(recipe=>{
    const div=document.createElement("div");
    div.classList.add("card");
    div.innerHTML=`
      <img src="${recipe.image || 'https://via.placeholder.com/400x200'}">
      <h3 style="padding:15px">${recipe.title}</h3>
    `;

    div.addEventListener("click",()=>{
      modal.style.display="flex";
      modalImg.src = recipe.image || 'https://via.placeholder.com/400x200';
      modalTitle.textContent = recipe.title;
      modalCategory.textContent = "Category: Custom";
      modalInstructions.textContent = recipe.instructions;
    });

    container.appendChild(div);
  });
}

// Default Load
if(container){
  fetchRecipes();
}

// Global Search
if(searchInput){
  searchInput.addEventListener("keyup",()=>{
    fetchRecipes(searchInput.value);
  });
}

// Close modal
if(closeBtn){
  closeBtn.onclick = ()=> modal.style.display="none";
}

window.onclick = function(e){
  if(e.target==modal){
    modal.style.display="none";
  }
}

// Add Recipe
const form=document.getElementById("recipeForm");
if(form){
  form.addEventListener("submit",(e)=>{
    e.preventDefault();

    const recipe={
      title:title.value,
      image:image.value,
      ingredients:ingredients.value,
      instructions:instructions.value
    };

    let recipes=JSON.parse(localStorage.getItem("myRecipes"))||[];
    recipes.push(recipe);
    localStorage.setItem("myRecipes",JSON.stringify(recipes));

    alert("Recipe Added Successfully!");
    form.reset();
  });
}