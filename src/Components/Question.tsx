import { FC } from "react";
import QuestionObj from "../Interface/QuestionObj";

const Question: FC<QuestionObj> = (props): JSX.Element => {
  return (
    <>
        <li className="p-2 shadow-md rounded-xl relative">
            <button className="btn btn-error btn-xs right-0 mr-2 absolute" onClick={() => {
              //@ts-expect-error showModal isn't expected on HTML Element, however it's imported through DaisyUI
              document.getElementById("my_modal_1" + props.id).showModal()
            }}>Delete?</button>
            <div className="">{props.question}</div>
            <div v-if="question.answer.length > 0" className="text-teal-500 font-semibold">{props.answer}</div>
        </li>
        <dialog id={"my_modal_1" + props.id} className="modal modal-middle">
          <div className="modal-box bg-slate-200">
            <h3 className="font-bold text-lg pb-6">Are you sure you want to delete your question?</h3>
            <div className="modal-action flex justify-center">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn mx-3 border-2 border-red-400 bg-slate-100 hover:bg-red-400 hover:text-white hover:border-red-400" onClick={() => {props.onDelete(props.id)}}>Yes</button>
                <button className="btn border-2 border-teal-300 bg-slate-100 hover:bg-teal-300 hover:text-white hover:border-teal-300">No</button>
              </form>
            </div>
          </div>
        </dialog>
    </>
  )
}

export default Question;
