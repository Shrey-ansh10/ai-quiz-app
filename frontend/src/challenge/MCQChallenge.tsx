import { useState } from "react"
import "react"

// {
//     "content" : 
//     "options" : [1,2,3,4]
//     correctAnswer : 0,
//      explaination : ""
// }


// this will be a component that display a single question - that way we can use this component whereever we display a question - i.e in history
export default function MCQChallenge({challenge, showExplaination = false}) {


    const [selectedOption, setSelectedOption] = useState(null);
    const [shouldShowExplaination, setShouldShowExplaination] = useState(showExplaination);
   

    // we will check for the if the options are in json fromat or not
    const options = typeof challenge.options === "string"
        ? JSON.parse(challenge.options) // if not parse to JSON
        : challenge.options // else let them be

    
    const handleOptionSelect = (index) => {
        if(selectedOption !== null) return; // if no option is selected - don't do anything

        // once the user selece an option - we will display it
        setSelectedOption(index);
        setShouldShowExplaination(true); // after selection - we will show if the ans is correct or incorrect - and along it we will also show the explaination
    }

    // once an option is selected - this will return the classname which displays if the selected option is correct or incorrect
    const getOptionClass = (index) => {
        if(selectedOption === null) return "option" 

        if(index === challenge.correct_answer_id) return "option correct";

        if(selectedOption === index && index !== challenge.correct_answer_id) return "option incorrect";

        return "option" // this return is kind of unnecessary
    }     


    return(
        <>
            <div className="challenge-display">
                <p><strong>Difficulty</strong>: {challenge.difficulty}</p>
                <p className="challenge-tittle"><strong>Title: </strong>{challenge.title}</p>
                <p><strong>Question: </strong>{challenge.description}</p>
                {/* <p>{challenge.code_snippet}</p> */}
                {challenge.code_snippet && (
                    <pre className="code-snippet">
                        <code>{challenge.code_snippet}</code>
                    </pre>
                )}
                <div className="option">
                    {options.map((option, index) => (
                        <div
                            className={getOptionClass(index)}
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                        >
                            {option}
                        </div>
                    ))}
                </div>

                {shouldShowExplaination && selectedOption !== null && (
                    <div className = "explaination">
                        <h4>Explaination : </h4>
                        <p>{challenge.explanation}</p>
                    </div>
                )}
            </div>

        </>
    )
}