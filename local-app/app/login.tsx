import { View } from "react-native";
import { TextField } from '@expo/ui/swift-ui';

function Login(){
    return (
        <div>
            <p>Login</p>
            <div>
                <label htmlFor="email">Email</label><br />
                <input type="text" name="email"/><br />
                <label htmlFor="password">Password</label><br />
                <input type="text" name="password"/>
            </div>
            <a href="register">Don't have an account? Register</a>
        </div>
    )
}

function LoginPage(){
    
}

export default Login