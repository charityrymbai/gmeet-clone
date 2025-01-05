import { Routes, Route } from "react-router-dom" 
import HomePage from "./pages/HomePage";
import CallPage from "./pages/CallPage";

const App = () => {
    return(
        <Routes>
            <Route path="" element={<HomePage />}></Route>
            <Route path="/call/:meetingIDStr" element={<CallPage/>}/>
        </Routes>
    )
    
}

export default App;