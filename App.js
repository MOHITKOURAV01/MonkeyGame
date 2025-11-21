import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableWithoutFeedback, TouchableOpacity, Image, ImageBackground,  } from "react-native";
import { Accelerometer } from 'expo-sensors';


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

const BULLET_WIDTH = 20;
const BULLET_HEIGHT = 25;

const BLOCK_WIDTH = 70;
const BLOCK_HEIGHT = 70;

export default function App() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0, })
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);
  const [bullet, setBullets] = useState([])
  const [blocks, setBlocks] = useState([])
  const [gameover, setGameover] = useState(false)
  const [count, setCount] = useState(0)

  const idRef = useRef(0);
  function uniqueId() {
    idRef.current += 1;
    return idRef.current;
  }


  useEffect(() => {
    Accelerometer.setUpdateInterval(16)
    const subscription = Accelerometer.addListener(data => {
      setData(data)
      setPlayerX(prev => {
        const newPos = prev - data.x * 40
        return Math.max(0, Math.min(screenWidth - PLAYER_WIDTH, newPos))
      })
    })
    return () => subscription.remove()
  }, [])

  function resetGame() {
    setGameover(false)
    setBlocks([])
    setBullets([])
    setCount(0);
    setPlayerX((screenWidth - PLAYER_WIDTH) / 2)
  }

  // Player component using Monkey image
  function PlayerShip({ size = PLAYER_WIDTH }) {
    return (
      <Image
        source={require("./assets/Monkey.png")}
        style={{ width: size, height: size, resizeMode: "contain" }}
      />
    );
  }

  // Enemy component using truck image - rotated 90 degrees
  function EnemyUFO({ size = BLOCK_WIDTH }) {
    return (
      <Image
        source={require("./assets/truck1.png")}
        style={{ 
          width: size, 
          height: size, 
          resizeMode: "contain",
          transform: [{ rotate: '90deg' }]
        }}
      />
    );
  }

  // Bullet component using bullet image
  function RetroBullet({ size = BULLET_WIDTH }) {
    return (
      <Image
        source={require("./assets/bullet-1.png")}
        style={{ width: size, height: size, resizeMode: "contain" }}
      />
    );
  }


  

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameover) return
      setBullets(prev => prev.map((b) => ({...b, y: b.y - 20})))
    }, 16)
    return () => {clearInterval(interval)}
  }, [gameover])

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameover) return
      blocks.forEach((block) => {
        bullet.forEach((b) => {
          //const coll = block.x + BLOCK_WIDTH

          if (b.x < block.x + BLOCK_WIDTH && b.x + BULLET_WIDTH > block.x && b.y < block.y + BLOCK_HEIGHT) {
            setBlocks(prev => prev.filter(bl => bl.id !== block.id))
            setBullets(prev => prev.filter(bu => bu.id !== b.id))
            setCount(prev => prev + 1)
          }
      })
    })
    

  }, 16)
    return () => clearInterval(interval)
  }, [bullet, blocks, gameover])
  
  function handleBullets() {
    setBullets(prev => [
      ...prev,
      {
        id: Date.now(),
        x: playerX + (PLAYER_WIDTH - BULLET_WIDTH )/ 2,
        y: screenHeight - 80,
      }
    ])
  }

  useEffect(() => {
  const interval = setInterval(() => {
    if (gameover) return
    setBlocks(prev => [
      ...prev,
      {
        id: uniqueId(),
        x: Math.random() * (screenWidth - BLOCK_WIDTH),
        y: -10,
      }
    ]);
  }, 1500)

    return () => clearInterval(interval)
  }, [gameover])


  useEffect(() => {
  const interval = setInterval(() => {
    if (gameover) return
    setBlocks(prev =>
      prev
        .map(b => ({ ...b, y: b.y + 7 }))
    )
  }, 16)

  return () => clearInterval(interval)
}, [gameover])


  useEffect(() => {
    const interval = setInterval(() => {
      if (gameover) return
      blocks.forEach(b => {
        const playerY = screenHeight - 20 - PLAYER_HEIGHT
        const collide = playerX < b.x + BLOCK_WIDTH && playerX + PLAYER_WIDTH > b.x && playerY < b.y + BLOCK_HEIGHT


        
        if (collide) {
          setGameover(true)
        }
      })
      
    }, 16)
    return () => clearInterval(interval)
  }, [blocks, playerX, gameover])

  return (
    <TouchableWithoutFeedback onPress={handleBullets}>
      <View style={{ flex: 1 }}>
  
        {/* Background Image Rotated 90 Degrees */}
        <Image
          source={require("./assets/road.png")}
          style={{
            position: "absolute",
            width: screenHeight,      // swapped
            height: screenWidth,      // swapped
            left: (screenWidth - screenHeight) / 2,
            top: (screenHeight - screenWidth) / 2,
            transform: [{ rotate: "90deg" }],
            resizeMode: "cover",
          }}
        />
  
        {/* GAME CONTENT */}
        {gameover ? (
          <>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <TouchableOpacity style={styles.restartBtn} onPress={resetGame}>
              <Text style={styles.restartText}>Restart</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {bullet.map(b => (
              <View key={b.id} style={[styles.bullet, { left: b.x, top: b.y }]}>
                <RetroBullet size={BULLET_WIDTH} />
              </View>
            ))}
  
            {blocks.map(b => (
              <View key={b.id} style={[styles.fallingBlock, { left: b.x, top: b.y }]}>
                <EnemyUFO size={BLOCK_WIDTH} />
              </View>
            ))}
  
            <View style={[styles.player, { left: playerX }]}>
              <PlayerShip size={PLAYER_WIDTH} />
            </View>
  
            <Text style={styles.instruction}>Tilt your phone to move</Text>
            <Text style={styles.countt}>Blocks Destroyed: {count}</Text>
          </>
        )}
  
      </View>
    </TouchableWithoutFeedback>
  );
  ;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },
  player: {
    position: "absolute",
    bottom: 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    position: "absolute",
    top: 47,
    color: "#fff",
    fontFamily: "mojang",
    fontSize: 14,
    width: "100%",
    textAlign: "center",
  },
  countt: {
    position: "absolute",
    top: 70,
    color: "#fff",
    fontFamily: "mojang",
    fontSize: 14,
    width: "100%",
    textAlign: "center",
  },
  bullet: {
    position: "absolute",
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  fallingBlock: {
    position: "absolute",
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 40,
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "mojang",
    width: "100%",
    textAlign: "center",
  },
  gameOverWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  restartBtn: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  restartText: {
    fontSize: 18,
    color: "#000",
    fontFamily: "Courier",
    textAlign: "center",
    width: "100%",
  },
});