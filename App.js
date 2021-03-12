import * as React from 'react';
import {
  StatusBar,
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { getMovies } from './api';
import Genres from './Genres';
import Rating from './Rating'
import MaskedView from '@react-native-community/masked-view'
import Svg , {Rect} from 'react-native-svg'
import {LinearGradient} from 'expo-linear-gradient'

const SPACING = 10;
const ITEM_SIZE = Platform.OS === 'ios' ? width * 0.72 : width * 0.74;

const AnimatedSVG = Animated.createAnimatedComponent(Svg)
const Loading = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.paragraph}>Loading...</Text>
  </View>
);

const Backdrop = ({movies,scrollX}) => {
 
 console.log('backdrop movies length = ',movies.length)

  return <View style={{width , height : height*0.6, position : 'absolute'}}> 
    <Animated.FlatList
    data = {movies}
    keyExtractor = {(item) => item.key}
    removeClippedSubviews={false}
    renderItem = {({item , index}) => {
      if(!item.backdrop){
        return null
      }
    
      const inputRange = [
        (index - 2) * ITEM_SIZE,
        (index - 1) * ITEM_SIZE,
      ];
      const translateX = scrollX.interpolate({
        inputRange,
        outputRange : [-width,0]
      })

      
  return <MaskedView style={{ position: 'absolute',}}
          maskElement = {
            <AnimatedSVG 
            width = {width}
            height = {height}
            viewBox = {`0  0  ${width} ${height}`}
            style={{transform : [{
              translateX : translateX
            }]}}
            >
            <Rect x='0' y='0' width = {width} height = {height} fill = {'red'}/>
            </AnimatedSVG>
          }
          >
          <Image
          source = {{uri : item.backdrop}}
          style={{
            resizeMode : 'cover',
            width ,
            height :  height*0.9,
          }}
          />
        </MaskedView>
        
    }}
    />
    <LinearGradient
    colors = {['transparent','white']}
    style={{
      width ,
      height : height*0.6,
      position: 'absolute',
      bottom : 0
    }}
    />
  </View>
}

export default function App() {
  const [movies, setMovies] = React.useState([]);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const fetchData = async () => {
      const movies = await getMovies();
      // Add empty items to create fake space
      // [empty_item, ...movies, empty_item]
      setMovies([{key : 'Left_Spacer'},...movies,{key : 'Right_Spacer'}]);
    };

    if (movies.length === 0) {
      fetchData(movies);
    }
  }, [movies]);

  if (movies.length === 0) {
    return <Loading />;

  }
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {console.log(movies.length)}
      <Backdrop movies = {movies} scrollX = {scrollX}/>
      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        data={movies}
        keyExtractor={(item) => item.key}
        horizontal
        bounces={false}
        decelerationRate={Platform.OS === 'ios' ? 0 : 0.98}
        contentContainerStyle={{ alignItems: 'center' }}
        snapToInterval={ITEM_SIZE}
        snapToAlignment='start'
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
        
          const inputRange = [
            (index - 2) * ITEM_SIZE,
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE, 
          ];

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [100, 50,100],
            
          });

          if(index === 0 ){
            return <View  style = {{width : (width - ITEM_SIZE)/2 }}/>;
          }
          else if (index === movies.length -1){
            return <View  style = {{width : (width - ITEM_SIZE)/2 }}/>;
          }
          else if(item.backdrop){
            return (
              <View style={{ width: ITEM_SIZE }}>
                <Animated.View
                  style={{
                    marginHorizontal: SPACING,
                    padding: SPACING * 2,
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderRadius: 34,
                    transform : [{
                      translateY : translateY
                    }]
                  }}
                >
                  <Image
                    source={{ uri: item.poster }}
                    style={styles.posterImage}
                  />
                  <Text style={{ fontSize: 24 }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Rating rating={item.rating} />
                  <Genres genres={item.genres} />
                  <Text style={{ fontSize: 12 }} numberOfLines={3}>
                    {item.description}
                  </Text>
                </Animated.View>
              </View>
            );
          }

        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  posterImage: {
    width: '100%',
    height: ITEM_SIZE * 1.2,
    resizeMode: 'cover',
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  },
});
