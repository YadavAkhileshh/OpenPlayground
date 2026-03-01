const schema = {
  users:["id","name","email","age"],
  orders:["id","user_id","amount","status"],
  products:["id","title","price","stock"]
};

const tableSelect = document.getElementById("tableSelect");
const columnsDiv = document.getElementById("columns");
const sqlOutput = document.getElementById("sqlOutput");

function renderColumns(){
  const table = tableSelect.value;
  columnsDiv.innerHTML = "";

  schema[table].forEach(col=>{
    const label=document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${col}">
      ${col}
    `;
    columnsDiv.appendChild(label);
  });
}

function buildQuery(){
  const table = tableSelect.value;

  const selected = [
    ...columnsDiv.querySelectorAll("input:checked")
  ].map(c=>c.value);

  const condition =
    document.getElementById("conditionInput").value.trim();

  const cols = selected.length ? selected.join(", ") : "*";

  let query = `SELECT ${cols} FROM ${table}`;

  if(condition){
    query += ` WHERE ${condition}`;
  }

  query += ";";

  sqlOutput.textContent = query;
}

document.getElementById("buildBtn")
  .addEventListener("click",buildQuery);

document.getElementById("clearBtn")
  .addEventListener("click",()=>{
    document.getElementById("conditionInput").value="";
    renderColumns();
    sqlOutput.textContent="SELECT * FROM users;";
  });

tableSelect.addEventListener("change",renderColumns);

renderColumns();