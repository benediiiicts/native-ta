import { View } from "react-native";

function Register(){
    return(
        <View>
            <p>Register</p>
            <div>
                <label htmlFor="email">Email</label><br />
                <input type="text" name="email"/><br />
                <label htmlFor="password">Password</label><br />
                <input type="text" name="password"/><br />
                <label htmlFor="confirm-password">Confirm Password</label><br />
                <input type="text" name="password"/>
            </div>
            <a href="login">have an account already? Login</a>
        </View>
    )
}

function RegisterPage(){

}

export default Register
