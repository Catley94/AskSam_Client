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
          Displays Cookie notification
            If User accepts cookies:
              Sends GET request to /questions/getclientid which returns a random guid
              Stores the guid in a cookie
              React sends GET request to /questions/{clientid} which returns all the questions in the database with the clientId attached.
              React populates question list.

            If User declines cookies:
              Check if there is an existing cookie and delete,
                otherwise, do nothing.
    User submits a question
      React sends POST request to server posting the data (guid, question, answered, answer).
      React sends GET request to /questions/{clientid} which returns all the questions in the database with the clientId attached.
      React populates question list.
  */

  // const AskSamAPILocation = "https://asksamapi.azurewebsites.net/questions";
  const AskSamAPILocation = "http://localhost:5125/questions";

  const cookieClientId: string = "clientId";  

  const msToCheckForAnswers = 10000;

  const header: string = "Ask Sam";
  
  const shiftKeyCode: number = 16;
  const enterKeyCode: number = 13;

  const [questions, setQuestions]: [QuestionObj[] | undefined, Dispatch<QuestionObj[] | undefined>] = useState<QuestionObj[]>();
  const [currentQuestion, setCurrentQuestion]: [string | number | readonly string[] | undefined, Dispatch<string | number | readonly string[] | undefined>] = useState<string | number | readonly string[] | undefined>("");
  const [shiftKeyHeldDown, setShiftKeyHeldDown]: [boolean, Dispatch<boolean>] = useState<boolean>(false);
  const [cookiesDeclined, setCookiesDeclined]: [boolean, Dispatch<boolean>] = useState<boolean>(false);

  useEffect(() => {
  
    const clientIdCookie = Cookies.get(cookieClientId);
    if(!clientIdCookie) {
      //Cookie does not exist
      showCookieNotification(true);
    } else {
      populateQuestionsFromAPI();

      setInterval(() => {
        populateQuestionsFromAPI();
      }, msToCheckForAnswers);

    }
  }, []); // The empty array ensures this effect runs only on initial render

  const showCookieNotification = (visible: boolean): void => {
    const cookieNotification: HTMLElement | null = document.getElementById("cookieNotification");
    if(cookieNotification) {
      if(visible) cookieNotification.classList.contains("hidden") && cookieNotification.classList.remove("hidden");
      if(!visible) !cookieNotification.classList.contains("hidden") && cookieNotification.classList.add("hidden");
    }
  }

  const populateQuestionsFromAPI = async (): Promise<void> => {

    await fetchAllQuestions()
      .then((questions) => {
        document.getElementById("loading_questions")?.classList.add("hidden");
        setQuestions(questions?.reverse());
      })
      .catch((error) => {
        console.error(error);
      })
  }

  const fetchAllQuestions = async (): Promise<QuestionObj[] | null> => {

    let _questionList: QuestionObj[] = [];
    if(cookiesDeclined) {
      console.error("Unable to POST question as cookies were declined, thus there is no unique id for this user.");
      return null;
    }
    const response = await fetch(`${AskSamAPILocation}/${Cookies.get(cookieClientId)}`, {
      method: "GET"
    })
    try {
      await response.json()
      .then((_questions) => {
        _questionList = _questions;
      })
      .catch((error) => {
        // console.error("Error fetching question list: ", error);
        throw Error(error);
      })
    }
    catch(error) {
      console.log(error);
    }
    return _questionList;
  }

  const submitQuestion = (): void => {
    const data = {
      clientGuid: Cookies.get(cookieClientId),
      answered: false,
      question: currentQuestion,
      answer: "",
      type: "General"
    }
    
    postDataToAPI(`${AskSamAPILocation}`, data)
      .then(() => {

      })
      .finally(() => {
        populateQuestionsFromAPI();
        setCurrentQuestion(""); //Resets TextArea to empty
      })
  }

  const postDataToAPI = async (url: string, data: object = {}): Promise<object> => {
    return toAPI("POST", url, data);
  }

  const deleteDataToAPI = async (url: string, data: object = {}): Promise<object> => {
    return toAPI("DELETE", url, data);
  }

  

  const toAPI = async (method: string, url: string, data: object): Promise<object> => {
    const response = await fetch(url, {
      method: method, // *GET, POST, PUT, DELETE, etc.
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

  const onAcceptCookies = () => {
    setCookiesDeclined(false);
    showCookieNotification(false);
    fetchUserIdAndPopulateQuestions();
  }

  const onDeclineCookies = () => {
    showCookieNotification(false);
    setCookiesDeclined(true);
    if(Cookies.get(cookieClientId)) Cookies.remove(cookieClientId);
  }

  const fetchUserIdAndPopulateQuestions = async (): Promise<void> => {
    const response = await fetch(`${AskSamAPILocation}/getclientid`, {
      method: "GET"
    })
    const data = await response.json();
    if(data) {
      createCookie(cookieClientId, data, 360);
      populateQuestionsFromAPI();
    }
  }

  const createCookie = (cookieName: string, data: string, days: number) => {
    Cookies.set(cookieName, data, { expires: days });
  }

  const onQuestionDelete = async (questionId: number): Promise<void> => {
    deleteDataToAPI(`${AskSamAPILocation}/${questionId}`)
      .then(() => {

      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        populateQuestionsFromAPI();
      })
    
  }

  return (
    <>
      <div id="askSamContainer" className="text-center py-12 bg-slate-200 text-slate-600">
        <div className="flex justify-center">
          <div id="cookieNotification" role="alert" className="hidden alert w-3/4 absolute lg:w-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>We use cookies to keep track of your unique id which will be saved with each question you ask. If you choose not to accept cookies, you will be unable to see the questions you ask or receive answers and the application will not work as intended.</span>
            <div>
              <button className="btn btn-sm" onClick={onDeclineCookies}>Deny</button>
              <button className="btn btn-sm btn-primary" onClick={onAcceptCookies}>Accept</button>
            </div>
          </div>
        </div>
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
                <span id="loading_questions" className="m-2 loading loading-dots loading-lg"></span>
                {questions !== undefined && questions?.map((question, i) => <Question {...question} onDelete={onQuestionDelete} key={i} />)}
              </ul>
          </div>
          
      </div>
    </>
  )
}

export default App


