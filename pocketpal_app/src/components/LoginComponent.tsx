import { useEffect, useState } from "react";
import Auth from "./AuthenticationComponent.tsx"
import { auth } from "../config/firebase";


LoginComponent() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setLoggedIn(true);
                console.log("User logged in");
            } else {
                setLoggedIn(false);
                console.log("User logged out");
            }
        });
    });

    return (
        <div>
            <Auth/>
            {loggedIn ? (
                <h4>Użytkownik zalogowany</h4>
            ) : (
                <h4>Użytkownik niezalogowany</h4>
            )}
            {loggedIn ? (
                <button onClick={() => auth.signOut()}>Wyloguj</button>
            ) : null}
        </div>
    );
}

export default LoginComponent;