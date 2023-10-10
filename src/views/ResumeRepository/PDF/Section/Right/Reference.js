import { Text, View } from '@react-pdf/renderer'
import Divider from './Divider'

const Reference = ({ items }) => {
  return (
    <View style={{ paddingTop: '20px' }}>
      <Text
        style={{
          color: '#000',
          fontSize: '15',
        }}
      >
        Reference
      </Text>
      <Divider />
      <Text style={{ fontSize: '11', marginTop: '4', textAlign:"justify" }}>{items}</Text>
    </View>
  )
}

export default Reference