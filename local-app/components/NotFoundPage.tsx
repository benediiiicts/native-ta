import {View, Text} from 'react-native'
import styles from '@/styles/NotFoundPage.styles'

function NotFoundPage(){
    return(
        <View style={styles.overlay}>
            <View style={styles.container}>
                <Text style={styles.statusText}>404</Text>
                <Text style={styles.messageText}>Page not found</Text>
            </View>
        </View>
    )
}

export default NotFoundPage