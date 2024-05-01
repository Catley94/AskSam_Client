interface QuestionObj {
    id: number,
    answered: boolean,
    question: string,
    answer: string,
    dateCreated: string,
    dateUpdated: string
    onDelete: (questionId: number) => Promise<void>
}

export default QuestionObj;