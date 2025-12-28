import { useAuth } from "@clerk/clerk-react"; // Imports useAuth from Clerk React.
// useAuth provides auth state and methods (e.g., getToken, userId, isSignedIn).



export const useApi = () => { // custom HOOK -> useApi() 
    // Hooks must start with use and follow React’s rules (call at the top level, not conditionally).

    // {} Destructures getToken from useAuth().
    const {getToken} = useAuth() // getToken() is async and returns a JWT for the current user. Returns null if not signed in
    
 
    // Returns an object with makeRequest for making authenticated API calls.
    const makeRequest = async (endpoint, options={}) => { // this hook allows us to acces this makeRequest function - this function let us send request 
        // endpoint: API path (e.g., "challenges").
        // options={}: Optional fetch options (http method, request body, request headers, etc.).
        
        const token =  await getToken() // get authentication token from clerk backend - Returns JWT or null
        
        // setting/building default request options
        const defaultOptions = {
            headers : { // default header is created with token we got from getToken()
                "Content-Type" : "application/json", // content type JSON
                "Authorization" : `Bearer ${token}`, // Authorization : Bearer token or Bearer null if not signed in
            }
        }

        // Making HTTP request and storing response in a var
        const response = await fetch(`http://localhost:8000/api/${endpoint}`, { // construct URL
            // merge default options with options - user options override default options
            ...defaultOptions, 
            ...options, 
        })

        // checks response status(200-299) - if error do the following
        if(!response.ok){
            const errorData = await response.json().catch(() => null) // Tries to parse JSON; falls back to null if parsing fails.
            if(response.status === 429){ // Special case for 429 (rate limit).
                throw new Error("Daily quota exceeded")
            }
            throw new Error(errorData?.detail || "An error occured") // in other cases - throw appropriate error
            // "errorData?.detail"  <- safely accesses detail if errorData exists.
        }

        // if no error occured
        return response.json(); // parse JSON response and return data to caller
    }

    return {makeRequest} // return the HOOK
}

// PROCESS FLOW: 
// 1. Component setup : In a react component the hook is called
// 2. Inside useApi() :
//     - calls useAuth() to get getToken()
//     - Defines makeRequest
// 3. when makeRequest is called:
//     User calls: makeRequest("challenges", { method: "POST", body: JSON.stringify({...}) })
//         ↓
//     getToken() is called → Returns JWT token (or null)
//         ↓
//     Default headers are created with token
//         ↓
//     Options are merged (user options override defaults)
//         ↓
//     fetch() sends request to http://localhost:8000/api/challenges
//         ↓
//     Response is received
//         ↓
//     If response.ok === false:
//         → Parse error JSON
//         → Check for 429 status
//         → Throw appropriate error
//         ↓
//     If response.ok === true:
//         → Parse JSON response
//         → Return data to caller

// EXAMPLE USAGE:
// const { makeRequest } = useApi();

// // GET request
// const data = await makeRequest("challenges"); // made request to challenges endpoint

// // POST request
// const newChallenge = await makeRequest("challenges", {
//     method: "POST",
//     body: JSON.stringify({ topic: "Math", difficulty: "hard" })
// });