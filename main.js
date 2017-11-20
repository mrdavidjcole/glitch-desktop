const menubar = require("menubar");
const axios = require("axios");
const { ipcMain } = require("electron");
const { Notification } = require("electron");
const { shell } = require("electron");
var path = require("path");
const fs = require("fs");

var mb = menubar({
  alwaysOnTop: true,
  icon: "glitch-icon@2x.png",
  showDockIcon: true,
  // preloadWindow: true
});

mb.on("ready", function ready() {
  console.log("app is ready");
  // your app code here

  mb.app.dock.setIcon(path.join(__dirname, "images", "glitch-logo.png"));

  ipcMain.on("log", (event, arg) => {
    console.log(arg);
  });

  checkForNewQuestionsMain();
  setInterval(() => {
    checkForNewQuestionsMain();
  }, 10000);
});

mb.on("after-create-window", () => {
  mb.window.openDevTools();
});

const checkForNewQuestionsMain = () => {
  var glitchApiRoot = "https://api.glitch.com";
  var questionsUrl = `${glitchApiRoot}/projects/questions`;

  console.log("checking for new questions...");
  axios
    .get(questionsUrl)
    .then(response => {
      return response.data;
    })
    .then(questions => {
      console.log("questions:", questions);

      // stubbing in a question for testing, so we don't have to spam Glitch with questions all the time
      var questions = [
        {
          userId: 182309,
          projectId: "df8b019a-a842-45b4-808c-78dc8ee3b239",
          details:
            '{"questionId":"d0JO1tf67Y18TB6v","projectId":"df8b019a-a842-45b4-808c-78dc8ee3b239","domain":"wistia-player-api-starter","path":"public/player-api-things.js","line":0,"character":1,"question":"test question, don\'t mind me","tags":["js"],"userTabId":"3642","userId":182309,"userLogin":"mrdavidjcole","userAvatar":"https://avatars0.githubusercontent.com/u/752729?v=4","userColor":"#f9ffa5","created":"2017-11-20T03:25:49.777Z","version":2}',
          updatedAt: "2017-11-20T03:26:29.955Z"
        }
      ];

      questions.forEach(question => {
        var details = JSON.parse(question.details);
        var { domain, line, character, userAvatar } = details;
        console.log("question:", details.question);

        if (Notification.isSupported()) {
          axios.get(userAvatar, {
            responseType: "arraybuffer"
          })
          .then(imageResponse => {
            fs.writeFile("avatar.jpg", imageResponse.data, "binary", function(err) {
              if (!err) {
                console.log("sending notification");
                let questionNotification = new Notification({
                  title: "New question on Glitch",
                  body: details.question,
                  icon: path.join(__dirname, "avatar.jpg"),
                  // http://audiosoundclips.com/8-bit-power-ups-retro-game-sound-effects-sfx/
                  sound: 'sounds/notifcation.m4a'
                });
                questionNotification.on("click", event => {
                  shell.openExternal(
                    `https://glitch.com/edit/#!/${domain}?path=${
                      details.path
                    }${line}:${details.character}`
                  );
                });
                questionNotification.show();
              }
            });
          });
        }
      });
    });
};
