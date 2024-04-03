import { Dispatch, FC, useEffect, useState } from 'react'
import './App.css'
import Question from './Components/Question';
import QuestionObj from './Interface/QuestionObj';
import Cookies from "js-cookie";
// import QuestionObj from './Interface/QuestionObj';

const App: FC = () => {

  /*
    App Flow:
    User loads the page
      React checks if there is a cookie with the same of "clientId"
        if no:
          Sends GET request to /questions/getclientid which returns a random guid
          Stores the guid in a cookie
      React sends GET request to /questions/{clientid} which returns all the questions in the database with the clientId attached.
      React populates question list.

    User submits a question
      React sends POST request to server posting the data (guid, question, answered, answer).
      React sends GET request to /questions/{clientid} which returns all the questions in the database with the clientId attached.
      React populates question list.
  */

  //TODO Add notifcation to allow cookies? (Cookies last 360 days)

  const cookieClientId: string = "clientId";  

  const header: string = "Ask Sam";
  
  const shiftKeyCode: number = 16;
  const enterKeyCode: number = 13;

  const [questions, setQuestions]: [QuestionObj[] | undefined, Dispatch<QuestionObj[] | undefined>] = useState<QuestionObj[]>();
  const [currentQuestion, setCurrentQuestion]: [string | number | readonly string[] | undefined, Dispatch<string | number | readonly string[] | undefined>] = useState<string | number | readonly string[] | undefined>("");
  const [shiftKeyHeldDown, setShiftKeyHeldDown]: [boolean, Dispatch<boolean>] = useState<boolean>(false);

  useEffect(() => {

    const fetchUserId = async (): Promise<void> => {
      const response = await fetch(`http://localhost:5125/questions/getclientid`, {
        method: "GET"
      })
      const data = await response.json();
      if(data) {
        Cookies.set(cookieClientId, data, { expires: 360 });
        populateQuestionsFromAPI();
      }
    }

    const clientIdCookie = Cookies.get(cookieClientId);
    if(!clientIdCookie) {
      //Check for UUID instead of question numbers
      fetchUserId();
    } else {
      populateQuestionsFromAPI();
    }

  }, []); // The empty array ensures this effect runs only on initial render

  const populateQuestionsFromAPI = async (): Promise<void> => {

    await fetchAllQuestions()
      .then((questions) => {
        setQuestions(questions.reverse());
      })
  }

  const fetchAllQuestions = async (): Promise<QuestionObj[]> => {

    let _questionList: QuestionObj[] = [];

    const response = await fetch(`http://localhost:5125/questions/${Cookies.get(cookieClientId)}`, {
      method: "GET"
    })
    await response.json()
    .then((_questions) => {
      _questionList = _questions;
    })
    .catch((error) => {
      console.error("Error fetching question list: ", error);
    })
    return _questionList;
  }

  const submitQuestion = (): void => {
    const data = {
      guid: Cookies.get(cookieClientId),
      answered: false,
      question: currentQuestion,
      answer: "",
      type: "General"
    }
    
    postDataToAPI("http://localhost:5125/questions", data)
      .then(() => {
        populateQuestionsFromAPI(); //Populates the question list
        setCurrentQuestion(""); //Resets TextArea to empty
      });
  }

  const postDataToAPI = async (url = "", data = {}): Promise<object> => {
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

  const onHandleKeyDown = (event: { keyCode: number; }): void => {
    if(event.keyCode === shiftKeyCode) setShiftKeyHeldDown(true);
    if(shiftKeyHeldDown && event.keyCode === enterKeyCode) submitQuestion();
  }

  const onHandleKeyUp = (event: { keyCode: number; }): void => {
    if(event.keyCode === shiftKeyCode) setShiftKeyHeldDown(false); 
  }

  

  

  

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
                {questions !== undefined && questions?.map((question, i) => <Question {...question} key={i} />)}
              </ul>
          </div>
          
      </div>
    </>
  )
}

export default App


