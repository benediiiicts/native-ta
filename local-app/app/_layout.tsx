import { Stack } from "expo-router";

function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}/>
    );
}

export default RootLayout