import React, { useContext } from 'react'
import { View, Text } from '@react-pdf/renderer'
import { ProfileContainer } from './Left/ProfileContainer'
//import { SVGItem } from './left/SVGItem'
//import styles from '../../../styles'
//import { SkillItem } from './left/SkillItem'
//import { BuilderContext } from '../../../App'

// const Socials = () => {
//   const ctx = useContext(BuilderContext)

//   return (
//     <View style={styles.socials__container}>
//       {ctx.getSocials().items.map((item, index) => {
//         if (item.enabled)
//           return (
//             <SVGItem
//               key={index}
//               viewBox={item.viewBox}
//               path={item.path}
//               url={item.url}
//             />
//           )
//       })}
//     </View>
//   )
// }
const Wrapper = ({ heading, ...props }) => {
  return (
    <View style={{ marginTop: '25', marginLeft: '15', marginRight: '15' }}>
      <Text
        style={{
          color: '#FFF',
          fontSize: '15',
          paddingBottom: '10',
        }}
      >
        {heading}
      </Text>
      {props.children}
    </View>
  )
}
const EducationText = ({ text, date }) => (
  <View style={{ paddingBottom: '10' }} key={text}>
    <Text style={{ color: '#fff', fontSize: '12' }}>{text}</Text>
    <Text style={{ color: '#fff', fontSize: '9', paddingTop: '3' }}>
      {date}
    </Text>
  </View>
)

export const Left = ({name, email, linkedInLink, contactNo, display}) => {
  return (
    <View style={{
      width: '40%',
      backgroundColor: '#084c41',
    }}>
      { <ProfileContainer
        name={name}
        email={email}
        url={linkedInLink}
        display={display}
        contactNo={contactNo}
        // display={profile.display}
      /> }
    </View>
  )
}