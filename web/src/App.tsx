import { Routes, Route } from "react-router-dom" 
import HomePage from "./pages/HomePage";
import CallPage from "./pages/CallPage";
import ErrorMessage from "./components/ErrorMessage";
import Error404 from "./components/Error404";

const App = () => {
    return(
        <Routes>
            <Route path="" element={<HomePage />}></Route>
            <Route path="/call/:meetingIDStr" element={<CallPage/>}/>
            <Route path="/call/" element={<ErrorMessage />}/>
            <Route path="/*" element={<Error404 />}/>
        </Routes>
    )
    
}

export default App;