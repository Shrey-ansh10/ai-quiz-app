
import { Route, Routes } from "react-router-dom";
import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes";
import ChallengeGenerator from "./challenge/ChallengeGenerator";
import HistoryPanel from "./history/HistoryPanel";
import {AuthenticationPage} from "./auth/AuthenticationPage";
import './App.css'
import Layout from "./layout/Layout";


function App() {

  return (
    <>     
    <ClerkProviderWithRoutes>
      <Routes> 
        <Route path="/sign-in/*" element={<AuthenticationPage/>} /> {/* creating Authentication page - so if user is at this route, we will render authentication page */}
        <Route path="/sign-up" element={<AuthenticationPage/>} ></Route> {/* clerk will handel the signup and sign in */}
        <Route element={<Layout />}> {/* This won't be self closing as -> Everything in this route will be rendered in the layout component - It will act as a parent div and all other components of out website will be in this component */}
          { /* Routes to various pages of our app */}
          <Route path="/" element={<ChallengeGenerator />} />
          <Route path="/history" element={<HistoryPanel /> } />
        </Route>

      </Routes>
    </ClerkProviderWithRoutes>
    </>
  )
}

export default App
