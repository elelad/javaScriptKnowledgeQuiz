/**
 * Created by Elad on 08/07/2016.
 */

var a = 0;
var Quiz = {}; //const object
Quiz.questionArray = []; // array to hold all question
Quiz.userAnswersArray = [];
Quiz.nextQuestion = 0; //var to hold the index for the next question
Quiz.totalQ = 10; // total questions in the quiz
Quiz.timeToAnswer = 30; // how much time the user have to answer the questions
Quiz.timer = 0;

class Question {
    constructor(id, question, ans1, ans2, ans3, ans4, rightAns) {
        this.id = id;
        this.question = question;
        this.ans1 = ans1;
        this.ans2 = ans2;
        this.ans3 = ans3;
        this.ans4 = ans4;
        this.rightAns = rightAns;
    }

    toScreen() {
        $("#qQuestion").html(this.question);
        $("#qAns1Lbl").html(this.ans1);
        $("#qAns2Lbl").html(this.ans2);
        $("#qAns3Lbl").html(this.ans3);
        $("#qAns4Lbl").html(this.ans4);
    }
} //class to hold question and diaplay it to screen

Quiz.getQuestionsFromJson = function () {
    $.ajax({
        url: "jsQuizData.json",
        dataType: "json",
        success: function (data) {
            Quiz.nextQuestion = 0;
            Quiz.questionArray.length = 0;
            Quiz.questionArray = [];
            Quiz.userAnswersArray.length = 0;
            Quiz.userAnswersArray = [];
            console.log("success");
            let i = 0;
            while (i < Quiz.totalQ) {
                var rnd = parseInt(Math.round(Math.random() * (data.Q.length - 1))); //get random number between 0 to respond length
                console.log("random number:" + rnd);
                var exist = false;
                Quiz.questionArray.forEach(item => ((item.id == rnd) ? exist = true : "")); //check if question already in questionArray
                if (exist == false) { //if not exist push it into questions array
                    Quiz.questionArray.push(new Question(rnd,
                        data.Q[rnd].question,
                        data.Q[rnd].ans1,
                        data.Q[rnd].ans2,
                        data.Q[rnd].ans3,
                        data.Q[rnd].ans4,
                        data.Q[rnd].rightAns));
                    i++;
                }
            }
            //$("#bResult").hide();
            $("#qIntro").hide();
            $("#bStart").hide();
            $("#bQuestion").show();
            $("#bNext").show();
            $("#bAnswers").val();
            Quiz.questionToScreen();
            //Quiz.goToNextQuestion();
        },
        error: function (e, a, b) {
            console.log("error " + a + " " + b);
        }
    })
}; //get all questions from json and trigger the first one into screen in success

Quiz.questionToScreen = function () {
    $(".answer").removeAttr("checked").checkboxradio("refresh"); // uncheck all radio for the new question
    if (Quiz.nextQuestion < Quiz.totalQ) { //if there is next question then show it
        Quiz.questionArray[Quiz.nextQuestion].toScreen();
        $("#qTimer").html("Time Left: " + Quiz.timeToAnswer);
        Quiz.nextQuestion++;
        $("#qCounter").html(Quiz.nextQuestion + "/" + Quiz.totalQ); //question counter up
        (Quiz.nextQuestion == Quiz.totalQ) ? $("#bNext").html("Finish") : $("#bNext").html("Next"); //if last Question display finish in btn;
        Quiz.stopTimer(); //stop previous timer if exist
        Quiz.startTimer(); //start new timer
    }else {  //if there isn't next question then calculate result
        Quiz.stopTimer();
        var userScore = 0; // value to hold result
        Quiz.userAnswersArray.forEach(function (item, index) { // iterate Quiz.userAnswersArray and if grade user answers
            console.log("index: " + index);
            if (item == Quiz.questionArray[index].rightAns) { // if user answer is right
                userScore += (100 / Quiz.totalQ);
            }
        });
        userScore = Math.round(userScore); //round score
        $("#bQuestion").hide();
        $("#bNext").hide();
        //$("#bResult").show();
        $("#bScore").html(userScore);
        $("#bStart").html("New Quiz").show();
        $("#resultPopup").popup("open");
    }
}; //display question to screen

Quiz.pushUserAnswer = function (answer) {
    if (answer != 0 && answer != undefined) {
        Quiz.userAnswersArray.push(answer);
        sessionStorage.setItem("userAnswersArray", JSON.stringify(Quiz.userAnswersArray));
    }
}; //get answer and put it in userAnswersArray

Quiz.validateUserAnswer = function () {
    var userAns = $('input[name=answer]:checked', '#bAnswers').val(); //get the answer from the radio boxes
    console.log("userAns: " + userAns);
    if ((userAns == "" || userAns == undefined) && Quiz.nextQuestion != 0) { //validate that user checked something.. if not popup msg
        return false
    } else { //if user checked something
        return userAns;
    }

}; //validate if user checked something

Quiz.userClickNext = function () {
    var answer = Quiz.validateUserAnswer();
    if (answer == false) { //validate that user checked something.. if not popup msg
        $("#noCheckPopup").popup("open");
    } else { //if user checked something
        Quiz.pushUserAnswer(answer); // if user have answer then push it to Quiz.userAnswersArray if not then push -1;
        Quiz.questionToScreen();
    }
}; //trigger by user click next/finish

Quiz.counter = 1; //var to hold counter for the timer
Quiz.startTimer = function () {
    Quiz.timer = setTimeout(function () {
        if (Quiz.counter < Quiz.timeToAnswer) { //if counter small then time to answer that set
            $("#qTimer").html("Time Left: " + (Quiz.timeToAnswer - Quiz.counter)); // display countdown
            Quiz.counter++;
            Quiz.startTimer(); //start timer again
        } else { //if time is up
            Quiz.counter = 1; //reset counter
            $("#qTimer").html("Time is Up!"); //show msg
            var answer = Quiz.validateUserAnswer(); //get user answer
            if (answer == false){ //if no answer
            Quiz.pushUserAnswer(-1); // if user didn't answer then push -1 to Quiz.userAnswersArray;
            }else {
                Quiz.pushUserAnswer(answer);
            }
            Quiz.questionToScreen();
            //Quiz.goToNextQuestion();
        }
    }, 1000)
};

Quiz.stopTimer = function () {
    clearTimeout(Quiz.timer);
    $("#qTimer").html();
    Quiz.counter = 1;
};



/*
* Quiz.goToNextQuestion = function () {
 var userAns = $('input[name=answer]:checked', '#bAnswers').val(); //get the answer from the radio boxes
 console.log("userAns: " + userAns);
 if ((userAns == "" || userAns == undefined) && Quiz.nextQuestion != 0) { //validate that user checked something.. if not popup msg
 $("#noCheckPopup").popup("open");
 } else { //if user checked something
 (userAns != undefined) ? Quiz.userAnswersArray.push(userAns) : ""; // if user have answer then push it to Quiz.userAnswersArray if not then push -1;
 if (Quiz.nextQuestion < Quiz.totalQ) { //if there is next question then show it
 Quiz.questionToScreen();
 $(".answer").removeAttr("checked").checkboxradio("refresh"); // uncheck all radio for the new question
 } else {  //if there isn't next question then calculate result
 var userScore = 0; // value to hold result
 Quiz.userAnswersArray.forEach(function (item, index) { // iterate Quiz.userAnswersArray and if grade user answers
 console.log("index: " + index);
 if (item == Quiz.questionArray[index].rightAns) { // if user answer is right
 userScore += (100 / Quiz.totalQ);
 }
 });
 userScore = Math.round(userScore); //round score
 $(".answer").removeAttr("checked").checkboxradio("refresh"); // uncheck all radio for the new quiz
 $("#bQuestion").hide();
 $("#bNext").hide();
 //$("#bResult").show();
 $("#bScore").html(userScore);
 $("#bStart").html("New Quiz").show();
 $("#resultPopup").popup("open");
 }
 }
 }; // iterate question into screen when user click next. or calculate result when user finished
*
* */