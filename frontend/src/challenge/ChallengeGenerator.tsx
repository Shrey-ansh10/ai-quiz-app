import "react"
import { useState, useEffect, useCallback } from "react"
import MCQChallenge from "./MCQChallenge"
import {useApi} from "../utils/api.js"

interface Quota {
    user_id: string;
    remaining_quota: number;
    last_reset_date: string;
}

export default function ChallengeGenerator() {
    
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState("easy");
    const [quota, setQuota] = useState<Quota | null>(null);
    const [isQuotaLoading, setIsQuotaLoading] = useState(true);
    const [quotaError, setQuotaError] = useState<string | null>(null);
    const {makeRequest} = useApi(); 

    // this function will get the remaining quota of the user - to query the LLM and generate challenge
    // Using useCallback to ensure stable reference for event listeners
    const fetchQuota = useCallback(async() => {
        setIsQuotaLoading(true)
        setQuotaError(null)
        try{
            const data = await makeRequest("challenges/quota")
            setQuota(data)
        } catch(err){ 
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch quota"
            console.error("Error fetching quota:", err)
            setQuotaError(errorMessage)
            // Don't set quota to null on error - keep previous value if available
        } finally {
            setIsQuotaLoading(false)
        }
    }, [makeRequest])

    useEffect(()=>{
        fetchQuota()
        
        // Refresh quota when window regains focus (user comes back to tab)
        const handleFocus = () => {
            fetchQuota()
        }
        window.addEventListener('focus', handleFocus)
        
        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [fetchQuota])

    // this function will carry the functionality to generate challenge
    const generateChallenge = async() => {
        setIsLoading(true) 
        setError(null) // clear any previous error before making a request 
        try{
            const data = await makeRequest("challenges/generate-challenge", {
                method: "POST",
                body: JSON.stringify({difficulty})
            });

            setChallenge(data);
            // Refresh quota after successful generation to show updated count
            await fetchQuota()
        } catch(err){
            const errorMessage = err instanceof Error ? err.message : "Failed to generate Challenge."
            setError(errorMessage)
            
            // If it's a quota error (429), refresh quota to show current state
            if (errorMessage.includes("quota") || errorMessage.includes("exceeded")) {
                await fetchQuota()
            }
        } finally {
            setIsLoading(false)
        }
        
    }
    
    // this will create a reset time, once the quota is empty
    const getNextResetTime = () => {
        if(!quota?.last_reset_date) return null;
        try {
            const lastReset = new Date(quota.last_reset_date)
            const nextReset = new Date(lastReset)
            nextReset.setHours(nextReset.getHours() + 24)
            
            // If next reset is in the past, it means quota should have been reset
            // Return null to indicate reset should happen soon
            if (nextReset < new Date()) {
                return null
            }
            
            return nextReset
        } catch (err) {
            console.error("Error calculating reset time:", err)
            return null
        }
    }

    return (
        <div className="challenge-container">
            <h2> Challenge Generator </h2>

            
            <div className="quota-display">
                {isQuotaLoading ? (
                    <p>Loading quota...</p>
                ) : quotaError ? (
                    <div>
                        <p>The challenges remaining today : {quota?.remaining_quota ?? "?"} </p>
                        <p className="quota-error">Unable to fetch quota. <button onClick={fetchQuota} style={{marginLeft: '8px', padding: '4px 8px'}}>Retry</button></p>
                    </div>
                ) : (
                    <>
                        <p>The challenges remaining today : {quota?.remaining_quota ?? 0} </p>
                        {quota?.remaining_quota === 0 && (
                            getNextResetTime() ? (
                                <p> Next reset: {getNextResetTime()?.toLocaleString()} </p>
                            ) : (
                                <p> Quota will reset soon. Please refresh the page. </p>
                            )
                        )}
                    </>
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
                disabled={isLoading || isQuotaLoading || quota?.remaining_quota === 0}
                className="generate-button"
                title={quota?.remaining_quota === 0 ? "Daily quota exhausted. Please wait for reset." : ""}
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