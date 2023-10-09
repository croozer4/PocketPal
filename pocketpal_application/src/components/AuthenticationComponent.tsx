import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";

const LoginComponent = () => {
    const login = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <h1>Logowanie</h1>
            <button onClick={login}>Zaloguj</button>
        </div>
    );
};

export default LoginComponent;