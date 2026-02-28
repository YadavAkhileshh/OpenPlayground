
    const truths=[
      "What is your biggest secret?",
      "Who was your first crush?",
      "What is something you are afraid to admit?",
      "Have you ever lied to your best friend?",
      "What is the most embarrassing thing you’ve done?",
      "Who do you secretly admire?"
    ]

    const dares=[
      "Send a funny emoji to the last person you texted 😂",
      "Sing a song for 30 seconds 🎤",
      "Post a random emoji on your status",
      "Do 10 jumping jacks 💪",
      "Speak in a funny accent for 1 minute",
      "Act like a cat for 20 seconds 🐱"
    ]

    const card=document.getElementById('card')
    const question=document.getElementById('question')

    function animate(){
      card.classList.add('animate')
      setTimeout(()=>card.classList.remove('animate'),400)
    }

    function getTruth(){
      question.textContent=truths[Math.floor(Math.random()*truths.length)]
      animate()
    }

    function getDare(){
      question.textContent=dares[Math.floor(Math.random()*dares.length)]
      animate()
    }

    function resetGame(){
      question.textContent='Ready to play?'
      animate()
    }
  