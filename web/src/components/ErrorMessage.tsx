import { useNavigate } from "react-router-dom";

const ErrorMessage = () => {
    const navigate = useNavigate();
    setTimeout(()=>{
        navigate("/")
    }, 5*1000);
    return (
        <div>
            <>Error getting you in the call. Redirecting.......</>
        </div>
    );
}

export default ErrorMessage;