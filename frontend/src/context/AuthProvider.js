import React, {createContext, useState} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [isLoading,setIsLoading] = useState(false);
    const [userToken,setUserToken] = useState(null);

    const UserLogin = () => {
        setUserToken('jhbiakbfkf');
        setIsLoading(false);
    }

    const UserLogOut = () => {
        setUserToken(null);
        setIsLoading(false);
    }

    return (
        <AuthContext.Provider value={{UserLogOut, UserLogin, isLoading, userToken}}>
            {children}
        </AuthContext.Provider>
    )
}