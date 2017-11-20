console.log("hi from the client");
const {shell} = require('electron');
const {ipcRenderer} = require('electron');

var glitchApiRoot = "https://api.glitch.com";
var questionsUrl = `${glitchApiRoot}/projects/questions`;

function checkFornewQuestions() {
  fetch(questionsUrl).then((response) => {
    return response.json();
  }).then((questions) => {
    var questionsListElem = document.getElementById("questions_list");

    var testLink = document.createElement("a");
    testLink.href = "https://glitch.com";
    testLink.innerHTML = "glitch link";
    testLink.addEventListener("click", (event) => {
      event.preventDefault();
      shell.openExternal(event.target.href);
    });
    questionsListElem.innerHTML = "";
    questionsListElem.appendChild(testLink);

    if (questions.length > 0) {
      ipcRenderer.send('log', `Got questions from Glitch API: ${questions}`);
      questionsListElem.innerHTML = "";
      questions.forEach((question) => {
        var details = JSON.parse(question.details);
        var questionListItemElem = document.createElement("li");
        questionListItemElem.innerHTML = `<a href="https://glitch.com/edit/#!/${details.domain}">${details.question}</a>`
        questionsListElem.appendChild(questionListItemElem);
      });
    }
  });
}

setInterval(() => {
  checkFornewQuestions();
}, 10000)

ipcRenderer.on('new-question', (event, arg) => {
  let questionNotification = new Notification('New question on Glitch', {
    body: arg.question
  });
  questionNotification.onclick = () => {
    shell.openExternal(`https://glitch.com/edit/#!/${details.domain}`);
  }
})
