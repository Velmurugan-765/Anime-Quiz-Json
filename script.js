let currentPage = 1;
const questionsPerPage = 5;
let userAnswers = {};

// Timer variables
const quizTimeInMinutes = 5;
let timeLeft = quizTimeInMinutes * 60; // Convert minutes to seconds
let timerInterval; // Interval variable for the timer

let questions = [];

function fetchQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched questions:', data); // Debugging log
            questions = data;
            renderQuestions();
            startTimer(); // Start the timer when the quiz loads
        })
        .catch(error => console.error('Error fetching questions:', error));
}

function renderQuestions() {
    console.log('Rendering questions...'); // Debugging log
    const start = (currentPage - 1) * questionsPerPage;
    const end = start + questionsPerPage;
    const questionsToDisplay = questions.slice(start, end);
    console.log('Questions to display:', questionsToDisplay); // Debugging log

    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    questionsToDisplay.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';

        const questionLabel = document.createElement('label');
        questionLabel.innerText = q.question;
        questionDiv.appendChild(questionLabel);

        const answerContainer = document.createElement('div');
        answerContainer.className = 'answer-container';

        if (q.type === 'radio') {
            q.options.forEach(option => {
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = `question-${start + index}`;
                radioInput.value = option;
                radioInput.checked = userAnswers[`question-${start + index}`] === option;

                const radioLabel = document.createElement('label');
                radioLabel.innerText = option;

                const radioWrapper = document.createElement('div');
                radioWrapper.className = 'radio-option';
                radioWrapper.appendChild(radioInput);
                radioWrapper.appendChild(radioLabel);

                answerContainer.appendChild(radioWrapper);
            });
        } else if (q.type === 'dropdown') {
            const select = document.createElement('select');
            select.name = `question-${start + index}`;

            q.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.innerText = option;
                if (userAnswers[`question-${start + index}`] === option) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            });
            answerContainer.appendChild(select);
        } else if (q.type === 'text') {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.name = `question-${start + index}`;
            if (userAnswers[`question-${start + index}`]) {
                textInput.value = userAnswers[`question-${start + index}`];
            }
            answerContainer.appendChild(textInput);
        }

        questionDiv.appendChild(answerContainer);
        questionsContainer.appendChild(questionDiv);
    });

    document.getElementById('prev-btn').style.display = currentPage === 1 ? 'none' : 'inline';
    document.getElementById('next-btn').style.display = currentPage * questionsPerPage >= questions.length ? 'none' : 'inline';
    document.getElementById('submit-btn').style.display = currentPage * questionsPerPage >= questions.length ? 'inline' : 'none';
}

function nextPage() {
    saveAnswers();
    if (currentPage * questionsPerPage < questions.length) {
        currentPage++;
        renderQuestions();
    }
}

function prevPage() {
    saveAnswers();
    if (currentPage > 1) {
        currentPage--;
        renderQuestions();
    }
}

function saveAnswers() {
    const start = (currentPage - 1) * questionsPerPage;
    const end = start + questionsPerPage;
    const questionsToDisplay = questions.slice(start, end);

    questionsToDisplay.forEach((q, index) => {
        if (q.type === 'radio') {
            const selectedOption = document.querySelector(`input[name="question-${start + index}"]:checked`);
            if (selectedOption) {
                userAnswers[`question-${start + index}`] = selectedOption.value;
            }
        } else if (q.type === 'dropdown') {
            const selectedOption = document.querySelector(`select[name="question-${start + index}"]`).value;
            userAnswers[`question-${start + index}`] = selectedOption;
        } else if (q.type === 'text') {
            const textInput = document.querySelector(`input[name="question-${start + index}"]`).value.trim();
            userAnswers[`question-${start + index}`] = textInput;
        }
    });
}

document.getElementById('quiz-form').addEventListener('submit', function(event) {
    event.preventDefault();
    saveAnswers();
    clearInterval(timerInterval); // Stop the timer when submitting
    showResults();
});

function showResults() {
    let score = 0;
    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';

    questions.forEach((q, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'result-question';

        const userAnswer = userAnswers[`question-${index}`];
        const correctAnswer = q.answer;

        const questionTitle = document.createElement('h3');
        questionTitle.textContent = q.question;
        answerDiv.appendChild(questionTitle);

        const userResponse = document.createElement('p');
        userResponse.textContent = `Your Answer: ${userAnswer}`;
        answerDiv.appendChild(userResponse);

        const correctResponse = document.createElement('p');
        correctResponse.textContent = `Correct Answer: ${correctAnswer}`;
        answerDiv.appendChild(correctResponse);

        if (userAnswer === correctAnswer) {
            answerDiv.classList.add('correct-answer');
            score++;
        } else {
            answerDiv.classList.add('incorrect-answer');
        }

        answersContainer.appendChild(answerDiv);
    });

    const scoreDisplay = document.createElement('p');
    scoreDisplay.textContent = `Your Score: ${score} out of ${questions.length}`;
    answersContainer.appendChild(scoreDisplay);

    document.getElementById('quiz-form').style.display = 'none';
    document.getElementById('results').style.display = 'block';
}

// Timer function
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    updateTimerDisplay(timerDisplay);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timerDisplay);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeLeft = 0; // Ensure timer display shows 0:00 at the end
            alert('Time\'s up! Submitting quiz.');
            document.getElementById('quiz-form').submit(); // Automatically submit quiz when time is up
        }
    }, 1000); // Update every second (1000 ms)
}

function updateTimerDisplay(timerDisplay) {
    const minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    if (seconds < 10) {
        seconds = `0${seconds}`; // Add leading zero for seconds less than 10
    }
    timerDisplay.textContent = `Time Left: ${minutes}:${seconds}`;
}

// Initial fetch and render
fetchQuestions();
