let userInput = document.getElementById('date');
userInput.max = new Date().toISOString().split("T")[0];
let result = document.getElementById('result');

function calculateAge() {
    var inputDate = document.getElementById('date').value;
    var unit = document.getElementById('unitSelector').value;

    if (!inputDate) {
        result.innerText = "Please select a valid date.";
        return;
    }
    var birthDate = new Date(inputDate);
    var currentDate = new Date();

    var timeDiff = currentDate - birthDate;

    switch (unit) {
        case 'years':
            var age = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
            var units = 'years';
            displayResult(age, units);
            break;
        case 'months':
            var ageInMonths = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30.44));
            var units = 'months';
            displayResult(ageInMonths, units);
            break;
        case 'days':
            var ageInDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            var units = 'days';
            displayResult(ageInDays, units);
            break;
        case 'dogYears':
            var ageInDogYears = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25) * 7); // Assuming 1 human year = 7 dog years
            var units = 'dog years';
            displayResult(ageInDogYears, units);
            break;
        case 'ymd': {
            let d1 = birthDate.getDate();
            let m1 = birthDate.getMonth();
            let y1 = birthDate.getFullYear();

            let d2 = currentDate.getDate();
            let m2 = currentDate.getMonth();
            let y2 = currentDate.getFullYear();

            let y3 = y2 - y1;
            let m3 = m2 - m1;
            let d3 = d2 - d1;

            if (d3 < 0) {
                m3--;
                d3 += new Date(y2, m2, 0).getDate();
            }

            if (m3 < 0) {
                y3--;
                m3 += 12;
            }

            result.innerText = `You are ${y3} years, ${m3} months and ${d3} days old!`;
            break;
        }

    }

    function displayResult(age, units) {
        var resultElement = document.getElementById('result');
        resultElement.textContent = 'You are ' + age + ' ' + units + ' old!';
    }

    // function resetFields() {
    //     document.getElementById('date').value = '';
    //     document.getElementById('unitSelector').value = 'ymd';
    //     document.getElementById('result').innerText = '';
    // }

}


function resetFields() {
    document.getElementById('date').value = '';
    document.getElementById('unitSelector').value = 'ymd';
    document.getElementById('result').innerText = '';
}

