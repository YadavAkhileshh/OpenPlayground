registerPlugin({

name:"Notes",

render(container){

container.innerHTML = `
<h2>Notes</h2>

<textarea id="noteArea" rows="10" cols="40"></textarea>

<br><br>

<button onclick="saveNote()">Save</button>
`

}

})

function saveNote(){

const note = document.getElementById("noteArea").value

localStorage.setItem("note", note)

alert("Note Saved")

}