import { FC, useEffect, useState } from 'react'
import './App.css'
import Question from './Components/Question';
import QuestionObj from './Interface/QuestionObj';
// import QuestionObj from './Interface/QuestionObj';

const App: FC = () => {

  const header: string = "Ask Sam";
  const questionList: QuestionObj[] = [
      {Id: 0, Answered: true, Question: "What is my question?", Answer: "No idea!", DateCreated: "2024/03/28", DateUpdated: "2024/03/28"},
      {Id: 1, Answered: false, Question: "Is this empty?", Answer: "", DateCreated: "2024/03/28", DateUpdated: ""},
  ]

  const [questions, setQuestions] = useState<QuestionObj[]>();


  const submitHandler = () => {
    console.log("Submit my question");
  }

  const deleteDatabaseHandler = () => {
    console.log("Cleared all items in DB");
  }

  const setMockData = () => {
    setQuestions([...questionList]);
    console.log(questions);
  }

  const populateQuestions = async () => {
    const response = await fetch('questions');
    const data = await response.json();
    setQuestions(data); //Returns an array of all forecasts
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
                  placeholder="What would you like to ask?"></textarea>
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


