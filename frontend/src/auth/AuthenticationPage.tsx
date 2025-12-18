import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react"
import React from "react"
// above are the components provided by Clerk - can be used directly

export function AuthenticationPage(){
    return (
        <>
            <div className="auth-container">
                <SignedOut>
                    <SignIn routing="path" path="/sign-in" />
                    <SignUp routing="path" path="/sign-up" />
                </SignedOut>

                <SignedIn> {/* Here we will have content that needs to be displayed when the user is signed in */}
                    <div className="redirect message" >
                        <p>You are already signed-in. </p>
                    </div>
                </SignedIn> 
                
            </div>    
        </>
    )
}