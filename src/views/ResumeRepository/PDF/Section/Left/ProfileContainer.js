import { Text, View, Image} from "@react-pdf/renderer";
import CapitalizeWord from "../../../../../utils/CapitalizeWord";
//import styles from '../../../../styles'

const ProfileImage = ({ display }) => (
  <>
    {display && (
      <Image
        cache={false}
        style={{
          width: "70px",
          height: "150px",
          borderRadius: "90",
        }}
        //src={require(URL.createObjectURL(display))}
        src={URL.createObjectURL(display)}
        //src={`data:image/png;base64,${base64ResourceFile.Base64}`}
      />
    )}
  </>
);

export const ProfileContainer = ({ name, email, url, contactNo, display }) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20",
        marginBottom: display ? "100px" : "-65px",
        height: "200",
        fontFamily: "Helvetica-Bold",
        wordWrap: 'break-word',
      }}
    >
      <ProfileImage display={display} />
      <View
        style={{
          justifyContent: "center",
          marginTop: "13px",
          marginBottom: "12px",
          
        }}
      >
        {/* <Image
        src={linkedInLogo}
        width="30px"
        height="30px"
        /> */}
        <Text
          style={{
            //paddingTop: "10px",
            paddingBottom: "20px",
            fontSize: "12px",
            fontWeight: "700",
            color: "white",
            paddingLeft: "5px",
            marginTop: "10%",
          }}
        >
          {CapitalizeWord(name)}
        </Text>
        <Text
          style={{
            paddingTop: "15px",
            paddingBottom: "15px",
            fontSize: "12px",
            fontWeight: "700",
            color: "white",
            paddingLeft: "5px",
          }}
        >
          {contactNo}
        </Text>
        {/* <Text
          style={{
            paddingTop: "10px",
            paddingBottom: "15px",
            fontSize: "9px",
            fontWeight: "500",
            color: "white",
            paddingLeft:"5px",
            //maxWidth:"100px",
          }}
        >
          {url}
        </Text>  */}
        <Text
          style={{
            paddingTop: "20px",
            paddingBottom: "15px",
            fontSize: "12px",
            fontWeight: "700",
            color: "white",
            paddingLeft: "5px",
          }}
        >
          {email}
        </Text>
      </View>
      {/* <Text style={styles.profession_text}>{profession}</Text> */}
      <View
        style={{
          marginTop: "10px",
          width: "10%",
          height: "1px",
          backgroundColor: "#FFF",
          textAlign: "center",
        }}
      />
    </View>
  );
};
