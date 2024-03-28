import { FC } from "react";
import QuestionObj from "../Interface/QuestionObj";

const Question: FC<QuestionObj> = (props): JSX.Element => {
  return (
    <>
        <li className="p-2 shadow-md rounded-xl">
            <div>{props.Question}</div>
            <div v-if="question.answer.length > 0" className="text-teal-500 font-semibold">{props.Answer}</div>
        </li>
    </>
  )
}

export default Question;
