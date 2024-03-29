import { FC, useEffect, useState } from 'react'
import './App.css'
import Question from './Components/Question';
import QuestionObj from './Interface/QuestionObj';
// import QuestionObj from './Interface/QuestionObj';

const App: FC = () => {

  const header: string = "Ask Sam";
  const questionList: QuestionObj[] = [
      {id: 0, answered: true, question: "What is my question?", answer: "No idea!", dateCreated: "2024/03/28", dateUpdated: "2024/03/28"},
      {id: 1, answered: false, question: "Is this empty?", answer: "", dateCreated: "2024/03/28", dateUpdated: ""},
  ]

  const [questions, setQuestions] = useState<QuestionObj[]>();
  const [currentQuestion, setCurrentQuestion] = useState<string | number | readonly string[] | undefined>("");


  const submitHandler = () => {
    console.log("Submit my question");
    const data = {
      answered: false,
      question: currentQuestion,
      answer: "",
      type: "General"
    }
    console.log("Sent to Server: ", data);
    postData("http://localhost:5125/questions", data);

  }

  const deleteDatabaseHandler = () => {
    console.log("Cleared all items in DB");
  }

  const setMockData = () => {
    setQuestions([...questionList]);
    console.log(questions);
  }

  const populateQuestions = async () => {
    const response = await fetch('http://localhost:5125/questions');
    const data = await response.json();
    if(data) console.log(data);
    setQuestions(data); //Returns an array of all forecasts
  }

  const   postData = async (url = "", data = {}) => {
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

  useEffect(() => {

    // setMockData();

    populateQuestions();

  }, []);

  return (
    <>
      <div id="askSamContainer" className="text-center py-12 bg-slate-200 text-slate-600">
          <h1 className="text-4xl font-semibold ">{header}</h1>
          <div className="bg-white rounded-xl mx-auto m-6 shadow-md max-w-3xl">
              
              <textarea v-model="question"
                  className=" bg-slate-50 rounded-xl shadow-md shadow-teal-200 p-3 w-full text-center focus:border-2 focus:border-teal-300 focus:outline-none"
                  placeholder="What would you like to ask?"
                  value={currentQuestion}
                  onChange={(event) => {
                    setCurrentQuestion(event.target.value);
                  }}
                  ></textarea>
              <div className="flex place-content-center h-16 ">
                  <button 
                      className="w-32 h-16 rounded border-2 border-teal-200 transition ease-in-out hover:border-white hover:bg-teal-200 duration-300 px-7 focus:bg-teal-200"
                      onClick={submitHandler}
                      >Submit</button>
                      
                  <button 
                      className="w-32 rounded border-2 border-red-200 transition ease-in-out hover:border-white hover:bg-red-200 duration-300 px-7 focus:bg-red-200"
                      onClick={deleteDatabaseHandler}
                      >Clear Database</button>
              </div>    
          </div>
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


