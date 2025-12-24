import "react"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"
import { Outlet, Link, Navigate } from "react-router-dom"

export default function Layout(){
    return (
        
            <div className="app-layout">
                <header className="app-header">
                    <div className="header-content">
                        <h1>Code Challenge Generator</h1>
                        <nav>
                            <SignedIn>
                                <Link to="/" >Generate Challenges</Link>
                                <Link to="/history" >History</Link>
                                <UserButton/>
                            </SignedIn>
                        </nav>
                    </div>
                </header>

                <main className="app-main" >
                    <SignedOut>
                        <Navigate to="/sign-in" replace />
                    </SignedOut>
                    <SignedIn>
                        <Outlet /> {/** The oultlet will render other child components in the Layout when the user is logged in.  */}
                    </SignedIn>
                </main>

                
            </div>
            
    )
}