import { useNavigate } from "react-router-dom";

const Error404 = () => {
    const navigate = useNavigate();
    setTimeout(()=>{
        navigate("/")
    }, 5*1000);
    return (
            <>Error 404: Page not found. Redirecting to home page.......</>
    );
}

export default Error404;