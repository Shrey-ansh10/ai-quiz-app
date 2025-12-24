import "react"
import { useState, useEffect } from "react"
import MCQChallenge from "../challenge/MCQChallenge";

export default function HistoryPanel(){
    
    const [history, setHistory] = useState([]); // an array
    const [isLoading, setIsLoading] = useState(true); // boolean
    const [error, setError] = useState(null); // 

    // this will run as soon as the component mounts
    useEffect(()=>{
        fetchHistory();

    },[])

    // function to retrieve the history
    const fetchHistory = async () => {
        setIsLoading(false);
    }

    // when the async function is loading/fetching history - we 
    if(isLoading){
        return <div className="loading">Loading History...</div>
    }

    // if an error occurs, due to any reason - we will display the error message
    if(error){
        return <div className="error-message">
            <p>{error}</p> {/** Displaying the error */}
            <button onClick={fetchHistory}>Retry</button> {/** Also display a retry button */}
        </div>
    }
    
    return (
        <>
        <div className="history-panel"> {/** History panel div */}
            <h2>History</h2> {/** Component Heading */}
            
            {history.length === 0 ? <p>No Challenge History present</p> : //if history array is 0 length, show this p-tag
            // else do this
                <div className="history-list"> {/** Div to return where we render all the chalenges */}
                    {history.map((challenge)=>{ // for each challenge - return MCQChallenge component with data
                         return <MCQChallenge 
                            challenge={challenge}
                            key = {challenge.id}
                            showExplaination // this will be true by default
                        />
                    })}
                </div>
            }
        </div>
        </>
    )
}