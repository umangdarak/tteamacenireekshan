import React from "react";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Circle } from "react-native-maps";
import tw from "twrnc";
import { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
const { height, width } = Dimensions.get("window");
const LATITUDE_DELTA = 0.28;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);
import { Asset } from "expo-asset";
import RotatingImage from "../../../misc/RotatingScreen";
import { auth, db } from "../../../firebaseConfig";
import { collection,doc,addDoc } from "firebase/firestore";
const ResultAirQuality = ({ route }) => {
  const { location } = route.params;
  const [aqiData, setAqiData] = useState(null);
  const [color, setColor] = useState(null);
  const [intense, setIntense] = useState(null);
  const [precautions, setPrecautions] = useState(null);
  const navigate = useNavigation();
  const [parameter, setParameter] = useState(null);
  const [impacts,setImpacts]=useState(null);
  const [precautionsair,setPrecautionsair]=useState(null);
  
  useEffect(() => {
    postDataToServer(location.coords.latitude, location.coords.longitude);
    Asset.loadAsync(require("../../../assets/Homebg.jpg"));
  }, []);
  useEffect(() => {
    const runCode = () => {
      if (aqiData && aqiData.predictedresult !== null) {
        const result = aqiData.predictedresult;

        if (result >= 0 && result <= 50) {
          setColor("#013220");
          setIntense("Very Good");
          setImpacts("Minimal Impact ")
          setPrecautionsair("Air quality is acceptable")
        } else if (result >= 51 && result <= 100) {
          setColor("#90EE90");
          setIntense("Good");
          setImpacts("May cause minor breathing discomfort to sensitive people")
          setPrecautionsair("No specific precautions necessary for the general population")
        } else if (result >= 101 && result <= 200) {
          setColor("#FFA500");
          setIntense("Moderately Polluted");
          setImpacts("May cause breathing discomfort to people with lung disease such as asthma, and discomfort to people with heart disease, children and older adults")
          setPrecautionsair("Maintain good health practices: stay hydrated, eat a balanced diet, and consult a doctor if experiencing breathing difficulties or related symptoms")
        } else if (result >= 201 && result <= 300) {
          setColor("#FFFF00");
          setIntense("Poor");
          setImpacts("May cause breathing discomfort to people on prolonged exposure, and discomfort to people with heart disease ")
          setPrecautionsair("Wear masks if going outside")
        } else if (result >= 301 && result <= 400) {
          setColor("#FF0000");
          setIntense("Very Poor");
          setImpacts("May cause respiratory illness to the people on prolonged exposure")
          setPrecautionsair("People with existing heart or respiratory illnesses, children, and elderly should limit outdoor exertion. Wear masks if going outside")
        }

        const parameterEffect = aqiData["parameterEffect"][1];
        if (parameterEffect && parameterEffect.length > 1) {
          const parameter = parameterEffect[1];
          setParameter(parameter);

          if (parameter === "PM10" || parameter === "PM2.5") {
            setPrecautions(
              "These particles, when inhaled, can penetrate deeper into the respiratory system and cause respiratory ailments such as asthma, coughing, sneezing, irritation in the airways, eyes, nose, throat irritation, etc"
            );
          } else if (parameter === "CO") {
            setPrecautions(
              "Increase in its concentration causes carbon monoxide poisoning (interference with oxygen-hemoglobin binding) in human beings, chest pain, heart diseases, reduced mental capabilities, vision problems, and contributes to smog formation."
            );
          } else if (parameter === "O3") {
            setPrecautions(
              "When ozone is inhaled by humans, reduced lung function, inflammation of airways, and irritation in the eyes, nose & throat are seen"
            );
          } else if (parameter === "NO2") {
            setPrecautions(
              "Nitrogen dioxide poisoning is as much as hazardous as carbon monoxide poisoning. It is when inhaled can cause serious damage to the heart, absorbed by the lungs, inflammation, and irritation of airways. Smog formation and foliage damage are some environmental impacts of nitrogen dioxide."
            );
          } else if (parameter === "SO2") {
            setPrecautions(
              "In humans, it causes breathing discomfort, asthma, eyes, nose, and throat irritation, inflammation of airways, and heart diseases"
            );
          } else if (parameter === "NH3") {
            setPrecautions(
              "Human beings experience immediate eyes, nose, throat, and respiratory tract burning, blindness, and lung damage upon exposure to high levels. It may cause coughing and irritation in the eyes, nose, and throat with low concentration exposure."
            );
          } else if (parameter === "NO") {
            setPrecautions(
              "Inhalation of high concentrations of nitric oxide can irritate the respiratory tract, leading to coughing, shortness of breath, and throat irritation"
            );
          }
        }
      }
      saveToFirestore()
    };
    runCode();
  }, [aqiData]);

  const saveToFirestore=async()=>{
    const user=auth.currentUser
    try{
      const userDocRef=doc(db,"users",user.uid)
      const aqicollection=collection(userDocRef,"aqi")
      const aqidoc=await addDoc(aqicollection,aqiData)
    }catch(e){
      console.log(e)
    }
  }

  const postDataToServer = async (latitude, longitude) => {
    try {
      const response = await fetch(
        "https://teamacenireekshanam.onrender.com/aqi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ latitude: latitude, longitude: longitude }),
        }
      );
      if (response.status == 200) {
        const data = await response.json();
        console.log(data);
        setAqiData(data);
      } else {
        Alert.alert("", "Error loading data");
        console.log(response.status);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };
  if (aqiData == null) {
    return <RotatingImage small={false} />;
  }

  return (
    
    <View style={tw`w-full h-full flex-1`}>
      <ImageBackground
        source={require("../../../assets/Homebg.jpg")}
        style={[
          tw`w-full h-full`,
          {
            flex: 1,
            position: "absolute",
            width: "100%",
            height: "100%",
          },
        ]}
        resizeMode="stretch"
      >
        <View style={tw`mt-10`}>
          <View style={tw`ml-4 flex-row items-center`}>
            <TouchableOpacity
              onPress={() => {
                navigate.navigate("Select");
              }}
            >
              <Ionicons name="chevron-back-outline" size={27} color="black" />
            </TouchableOpacity>
            <Text style={tw`text-2xl text-black ml-1 font-bold`}>
              Air Quality Index
            </Text>
          </View>
          <View style={tw` h-50 m-4 rounded-xl`}>
            {aqiData && (
              <MapView
                mapType="standard"
                zoomEnabled={true}
                loadingEnabled
                scrollEnabled={true}
                showsScale={true}
                region={{
                  latitude: location?.coords?.latitude || 0,
                  latitudeDelta: LATITUDE_DELTA,
                  longitude: location?.coords?.longitude || 0,
                  longitudeDelta: LONGITUDE_DELTA,
                }}
                style={tw`w-full h-full rounded-3xl`}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="You are here"
                />
                <Circle
                  center={location.coords}
                  radius={5000}
                  fillColor={color}
                />
              </MapView>
            )}
          </View>
          {aqiData && (
            <View>
              <View style={tw`flex-col items-center m-2`}>
                <Text style={tw`text-2xl font-bold`}>
                  The Air Quality Index in your region is:
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Text style={[tw`text-2xl font-bold text-blue-700 mt-4`]}>
                    {aqiData["predictedresult"]}
                  </Text>
                  <Text style={[tw`text-2xl font-bold ml-4 mt-4`, { color: color }]}>
                    {intense}
                  </Text>
                </View>
              </View>
              <View style={tw`flex-col  m-2 ml-6`}>
                <Text style={tw`text-2xl font-bold`}>
                  Impact:
                </Text>
                <View style={tw`flex-row justify-center`}>
                <Text style={tw`text-3xl font-bold text-blue-700 mt-4`}>
                  {impacts}
                </Text>
                </View>
              </View>
              <View style={tw`flex-col  m-2 ml-6`}>
                <Text style={tw`text-2xl font-bold`}>
                  Precautions to take for air:
                </Text>
                <View style={tw`flex-row justify-center`}>
                <Text style={tw`text-3xl font-bold text-blue-700 mt-4`}>
                  {precautionsair}
                </Text>
                </View>
              </View>
              <View style={tw`flex-col items-center m-2`}>
                <Text style={tw`text-2xl font-bold`}>
                  The Parameter Effecting the most is :
                </Text>
                <Text style={tw`text-3xl font-bold text-blue-700 mt-4`}>
                  {aqiData["parameterEffect"][1]}
                </Text>
              </View>
              <View style={tw`flex-col  m-2 ml-6`}>
                <Text style={tw`text-2xl font-bold`}>
                  The Concentration of {aqiData["parameterEffect"][1]}:
                </Text>
                <View style={tw`flex-row justify-center`}>
                <Text style={tw`text-3xl font-bold text-blue-700 mt-4`}>
                  {aqiData["parameterEffect"][0]}
                </Text>
                </View>
              </View>
              
              <View style={tw`flex-col items-start m-6`}>
                <Text style={tw`text-2xl font-bold`}>Precautions:</Text>
                <Text style={tw`text-2xl font-bold text-blue-700`}>
                  {precautions ? precautions : "No precautions available"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default ResultAirQuality;
