import { FC, useEffect, useState } from 'react'
import './App.css'
import Question from './Components/Question';
import QuestionObj from './Interface/QuestionObj';
import Cookies from "js-cookie";
// import QuestionObj from './Interface/QuestionObj';

const App: FC = () => {

  /*
    TODO:
      Using Question IDs isn't very safe, a user could alter the cookie, then see other questions.
      Server should assign a unique ID when requesting for the first time.
      ID should be stored in cookie.

      When sending requests, send ID of client with it, 
      Server can then search for any ID matching client IDs, to send back the list of questions.

      Will need to post client ID with request.
  */

  // Example array of numbers
  // const cookieQuestionIds: number[] = [];  
  const cookieClientId = "clientId";  

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
      guid: Cookies.get(cookieClientId),
      answered: false,
      question: currentQuestion,
      answer: "",
      type: "General"
    }
    postDataToAPI("http://localhost:5125/questions", data)
      .then((question) => {
        console.log("%c Returned Post Obj: ", "background: orange; font-weight:bold;");
        console.log(question);
        populateQuestionsFromAPI(); //Populates the question list
        setCurrentQuestion(""); //Resets TextArea to empty
      });
  }

  const setMockData = () => {
    setQuestions([...questionList]);
    console.log(questions);
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

  const populateQuestionsFromAPI = async () => {

    await fetchAllQuestions()
      .then((questions) => {
        console.log("%c Setting questions in list", "background: skyblue; font-weight: bold;");
        console.log(questions);
        setQuestions(questions);
      })
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

  // useEffect(() => {

  //   // setMockData();
  //   const fetchQuestions = async () => {
  //     if (cookieQuestionIds && cookieQuestionIds.length > 0) {
  //       const queryString = cookieQuestionIds.map(id => `ids=${id}`).join('&');
  //       const response = await fetch(`http://localhost:5125/questions?${queryString}`, {
  //         method: "GET"
  //       });
  //       const data = await response.json();
  //       if (data) {
  //         console.log(data);
  //         setQuestions(data.reverse()); // Returns an array of all forecasts
  //       }
  //     }
  //   };
  //   fetchQuestions();

  // }, []);

  useEffect(() => {

    const fetchUserId = async () => {
      const response = await fetch(`http://localhost:5125/questions/getclientid`, {
        method: "GET"
      })
      const data = await response.json();
      if(data) {
        console.log(data);
        Cookies.set(cookieClientId, data);
      }
    }

    



    const clientIdCookie = Cookies.get(cookieClientId);
    if(!clientIdCookie) {
      //Check for UUID instead of question numbers
      fetchUserId();
    }

    populateQuestionsFromAPI();


    // // Read the cookie on initial render
    // const cookie = Cookies.get(cookieQuestionName);
    // if (cookie) {
    //   // Parse the cookie value and update the state
    //   const parsedIds = JSON.parse(cookie);
    //   setCookieQuestionIds(parsedIds);
    // }
    


  }, []); // The empty array ensures this effect runs only on initial render

  // useEffect(() => {
  //   const fetchQuestions = async () => {
  //     if (cookieQuestionIds && cookieQuestionIds.length > 0) {
  //       const queryString = cookieQuestionIds.map(id => `ids=${id}`).join('&');
  //       if(queryString != "") {
  //         const response = await fetch(`http://localhost:5125/questions?${queryString}`, {
  //           method: "GET"
  //         });
  //         const data = await response.json();
  //         if (data) {
  //           console.log(data);
  //           setQuestions(data.reverse()); // Returns an array of all forecasts
  //         }
  //       }
  //     }
  //   };
  

    
  //   fetchQuestions();
  // }, [cookieQuestionIds]);

  

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


