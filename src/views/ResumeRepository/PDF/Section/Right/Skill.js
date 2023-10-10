import { Text, View } from '@react-pdf/renderer'
import Divider from './Divider'

const Skill = ({ skills }) => {
  return (
    <View>
        <View style={{ paddingTop: '10px' }}>
          <Text
            style={{
              color: '#000',
              fontSize: '15',
            }}
          >
            Skills
          </Text>
          <Divider />
          <Text style={{ fontSize: '11', marginTop: '4' , textAlign:"justify"}}>{skills}</Text>
        </View>
    </View>
  )
}

export default Skill