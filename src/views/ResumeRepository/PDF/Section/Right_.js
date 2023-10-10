import About from './Right/About'
import { View } from '@react-pdf/renderer'
//import { BuilderContext } from '../../../App'
import { useContext } from 'react'
import Skill from './Right/Skill'
import Experience from './Right/Experience'
import Education from './Right/Education'
import Reference from './Right/Reference'
import Link from './Right/Link'

export const Right = ({about, experience,skill, education, reference, linkedInLink}  ) => {
  return (
    <View style={{
      margin: 10,
      padding: 10,
      paddingTop: 20,
      width: '75%',
    }}>
      <About text={about} />
      <Experience items={experience} />
      <Education items={education}/>
      <Skill skills={skill} />
      <Reference items={reference} />
      <Link items={linkedInLink}></Link>
      
    </View>
  )
}