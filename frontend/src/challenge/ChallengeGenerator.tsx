import "react"
import { useState, useEffect } from "react"
import MCQChallenge from "./MCQChallenge"
import {useApi} from "../utils/api.js"

export default function ChallengeGenerator() {
    
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [difficulty, setDifficulty] = useState("easy");
    const [quota, setQuota] = useState(null);
    const {makeRequest} = useApi(); 

    useEffect(()=>{
        fetchQuota()
    }, [])

    // this function will get the remaining quota of the user - to query the LLM and generate challenge
    const fetchQuota = async() => {
        try{
            const data = await makeRequest("challenges/quota")
            setQuota(data)
        } catch(err){ // catch any error if it occurs
            console.log(err)
        }
    }

    // this function will carry the functionality to generate challenge
    const generateChallenge = async() => {
        setIsLoading(true) // 
        setError(null) // clear any previous error before making a request 
        try{
            const data = await makeRequest("challenges/generate-challenge", {
                method: "POST",
                body: JSON.stringify({difficulty})
            });

            setChallenge(data);
            fetchQuota()
        } catch(err){
            setError(err.message || "Failed to generate Challenge.")
        } finally {
            setIsLoading(false)
        }
        
    }
    
    // this will create a reset time, once the quota is empty
    const getNextResetTime = () => {
        if(!quota?.last_reset_data) return null;
        const resetData = new Date(quota.last_reset_data)
        PaymentRequestUpdateEvent.setHours(PaymentRequestUpdateEvent.getHours() + 24)
        return resetData
    }

    return (
        <div className="challenge-container">
            <h2> Challenge Generator </h2>

            
            <div className="quota-display">
                <p>The challenges remaining today : {quota?.remaining_quota || 0} </p>
                {quota?.remaining_quota === 0 && (
                    <p> Next reset: {0} </p> //we will display the time when the quota will be reseted
                )}
            </div>

            <div className="difficulty-selector"> 
                    <label htmlFor="difficulty" >Select Difficulty</label>

                    <select
                        id="difficulty" 
                        value={difficulty}  
                        onChange={(e) => {setDifficulty(e.target.value)}}
                        disabled = {isLoading}
                    >
                            <option value="easy" >Easy </option>
                            <option value="medium" >Medium </option>
                            <option value="hard" >Hard </option>
                    </select>
            </div>

            <button 
                onClick={generateChallenge}
                disabled= {false} /* {isLoading || quota?.remaining_quota === 0} */
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