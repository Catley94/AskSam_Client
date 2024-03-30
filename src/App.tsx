import { FC, useEffect, useState } from 'react'
import './App.css'
import Question from './Components/Question';
import QuestionObj from './Interface/QuestionObj';
// import QuestionObj from './Interface/QuestionObj';

const App: FC = () => {

  // Example array of numbers
  const ids = [1, 2, 3, 4];
  // Create a query string with all the ids
  const queryString = ids.map(id => `ids=${id}`).join('&');

  const header: string = "Ask Sam";
  const questionList: QuestionObj[] = [
      {id: 0, answered: true, question: "What is my question?", answer: "No idea!", dateCreated: "2024/03/28", dateUpdated: "2024/03/28"},
      {id: 1, answered: false, question: "Is this empty?", answer: "", dateCreated: "2024/03/28", dateUpdated: ""},
  ]
  const shiftKeyCode = 16;
  const enterKeyCode = 13;

  const [questions, setQuestions] = useState<QuestionObj[]>();
  const [currentQuestion, setCurrentQuestion] = useState<string | number | readonly string[] | undefined>("");
  const [shiftKeyHeldDown, setShiftKeyHeldDown] = useState<boolean>(false);


  const submitQuestion = () => {
    const data = {
      answered: false,
      question: currentQuestion,
      answer: "",
      type: "General"
    }
    postDataToAPI("http://localhost:5125/questions", data)
      .then(() => {
        populateQuestionsFromAPI();
        setCurrentQuestion("");
        //Set cookie with questionIDs
      });
  }

  const setMockData = () => {
    setQuestions([...questionList]);
    console.log(questions);
  }

  const populateQuestionsFromAPI = async () => {
    const response = await fetch(`http://localhost:5125/questions?${queryString}`, {
      method: "GET"
    });
    await response.json()
      .then((_data) => {

        if(_data) console.log(_data);
        setQuestions(_data.reverse()); //Returns an array of all forecasts
      })
      .catch(error => console.error("Error: ", error));

  }

  const postDataToAPI = async (url = "", data = {}) => {
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  const onHandleKeyDown = (event: { keyCode: number; }) => {
    if(event.keyCode === shiftKeyCode) setShiftKeyHeldDown(true);
    if(shiftKeyHeldDown && event.keyCode === enterKeyCode) submitQuestion();
  }

  const onHandleKeyUp = (event: { keyCode: number; }) => {
    if(event.keyCode === shiftKeyCode) setShiftKeyHeldDown(false); 
  }

  useEffect(() => {

    // setMockData();

    populateQuestionsFromAPI();

  }, []);

  return (
    <>
      <div id="askSamContainer" className="text-center py-12 bg-slate-200 text-slate-600">
          <h1 className="text-4xl font-semibold ">{header}</h1>
          <div className="flex bg-white rounded-xl mx-auto m-6 shadow-md max-w-3xl">
              
              <textarea v-model="question"
                  className=" bg-slate-50 rounded-xl shadow-md shadow-teal-200 p-3 w-full text-center focus:border-2 focus:border-teal-300 focus:outline-none"
                  placeholder="What would you like to ask?"
                  value={currentQuestion}
                  onChange={(event) => {
                    setCurrentQuestion(event.target.value);
                  }}
                  onKeyDown={onHandleKeyDown}
                  onKeyUp={onHandleKeyUp}
                  ></textarea>
              <div className="">
                  <button 
                      className="w-32 h-full rounded border-2 border-teal-200 transition ease-in-out hover:border-white hover:bg-teal-200 duration-300 px-7 focus:bg-teal-200"
                      onClick={submitQuestion}
                      >Submit</button>
              </div>    
          </div>
          <span className="text-gray-400 italic">Desktop: Shift + Enter to Submit</span>
          <div>
              <h1 className="font-semibold text-2xl p-3">Question History</h1>
              <ul className="bg-white shadow-md rounded-xl mx-auto max-w-lg">
                {questions?.map((question, i) => <Question {...question} key={i} />)}
              </ul>
          </div>
          
      </div>
    </>
  )
}

export default App


