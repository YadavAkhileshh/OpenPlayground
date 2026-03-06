function runCode(){

const html=document.getElementById("htmlCode").value
const css=document.getElementById("cssCode").value
const js=document.getElementById("jsCode").value

const preview=document.getElementById("preview")

const code=`
<html>
<head>
<style>${css}</style>
</head>
<body>

${html}

<script>
${js}
</script>

</body>
</html>
`

preview.srcdoc=code

}