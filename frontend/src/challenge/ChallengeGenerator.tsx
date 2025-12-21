import "react"
import { useState, useEffect } from "react"
import MCQChallenge from "./MCQChallenge"

export default function ChallengeGenerator() {
    
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [difficulty, setDifficulty] = useState("easy");
    const [quota, setQuota] = useState(null);

    // this function will get the remaining quota of the user - to query the LLM and generate challenge
    const fetchQuota = async() => {}

    // this function will carry the functionality to generate challenge
    const generateChallenge = async() => {}
    
    // this will create a reset time, once the quota is empty
    const getNextResetTime = () => {}

    return (
        <div className="challenge-container">
            <h2> Challenge Generator </h2>

            
            <div className="quota-display">
                <p>The challenges remaining today : {quota?.quota_remaining || 0} </p>
                {quota?.quota_remaining === 0 && (
                    <p> Next reset: {0} </p> //we will display the time when the quota will be reseted
                )}
            </div>

            <div className="difficulty-selector"> 
                    <label htmlFor="difficulty" >Select Difficulty</label>

                    <select
                        id="difficulty" 
                        value={difficulty}  
                        onChange={(e) => {setDifficulty(e.target.value)}}
                        disabled = {isLoading}>
                            <option value="easy" >Easy </option>
                            <option value="medium" >Medium </option>
                            <option value="hard" >Hard </option>
                    </select>
            </div>

            <button 
                onClick={generateChallenge}
                disabled={isLoading || quota?.quota_remaining === 0}
                className="generate-button"
            >
                {isLoading ? "Generating..." : "Generate Challenge"}
            </button>

            {error && <div className="error-message">
                <p>{error}</p>
            </div>}

            {challenge && <MCQChallenge challenge={challenge} />} 

        </div>
    )
}