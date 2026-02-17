
    const PASSWORD = "1234"; // Change your password here
    const diaryText = document.getElementById('diaryText');
    const lockScreen = document.querySelector('.lock-screen');
    const diaryScreen = document.querySelector('.diary-screen');
    const errorMsg = document.getElementById('errorMsg');

    // Load saved diary from localStorage
    window.onload = function() {
        if(localStorage.getItem('diaryContent')) {
            diaryText.value = localStorage.getItem('diaryContent');
        }
    }

    function unlockDiary() {
        const input = document.getElementById('passwordInput').value;
        if(input === PASSWORD) {
            lockScreen.style.display = 'none';
            diaryScreen.style.display = 'flex';
            errorMsg.textContent = '';
        } else {
            errorMsg.textContent = "Incorrect password!";
        }
    }

    function lockDiary() {
        diaryScreen.style.display = 'none';
        lockScreen.style.display = 'block';
        document.getElementById('passwordInput').value = '';
    }

    function saveDiary() {
        localStorage.setItem('diaryContent', diaryText.value);
        alert("Diary saved successfully!");
    }
