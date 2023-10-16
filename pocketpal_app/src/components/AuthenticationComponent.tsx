import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
//import Google Icon from tabler icons;
// import { IconGoogle } from '@tabler/icons-react';


const AuthComponent = () => {
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
            
            <button onClick={login}>Google</button>
        </div>
    );
};

export default AuthComponent;