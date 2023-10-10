
import { Text, View } from '@react-pdf/renderer'
//import styles from '../../../../styles'
import Divider from './Divider'

const About = ({ text }) => (
  <View>
    <Text
      style={{
        color: '#000',
        fontSize: '15',
      }}
      
    >
      About Me
    </Text>
    <Divider />
    <Text style={{
    fontSize: '11',
    textAlign:"justify"
  }}>{text}</Text>
  </View>
)
export default About