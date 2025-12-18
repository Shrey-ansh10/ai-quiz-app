import {ClerkProvider} from "@clerk/clerk-react"
import {BrowserRouter} from "react-router-dom";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// creating the clerk provider here as it provides better code readiability - we can use this component directly in the whole code as need
export default function ClerkProviderWithRoutes({children}){
    return(
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </ClerkProvider>
    )
}