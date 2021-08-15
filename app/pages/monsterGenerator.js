import React, { useEffect } from 'react'
import MonsterTable from './monsterTable'

const MonsterGenerator = (props) => {
    
    const [compensate, setCompensate] = React.useState( true)
    const [seed, setSeed] = React.useState(111)
    const [players, setPlayers] = React.useState(4)
    const [playerLevel, setPlayerLevel] = React.useState(1)
    const [charLevels, setCharLevels] = React.useState([1, 1, 1, 1])
    const setCharLevelArray = () => {
        var arr = []
        for (var i = 0; i < players; i++){
            arr.push(playerLevel)
            //console.log("playerl " + playerLevel)
        }
        setCharLevels(arr)
    }
    useEffect(() => {
        setCharLevelArray()
    }, [players, playerLevel])
//    
    const [maxMonsters, setMaxMonsters] = React.useState(10)
    const [difficulty, setDifficulty] = React.useState(1)
    return <div className="container">
        
        <div >
            <div>
            Compensate for Action Economy <input type="checkbox" checked = {compensate} onChange={(event) => {setCompensate(event.target.checked)}} />

            </div>
            <div>
            Players: <input type="number" min="1" max="20" value={players} onChange = {(event) => {setPlayers(event.target.value); }}/>
            x Level <input type="number" min="1" max="20" value={playerLevel} onChange = {(event) => {setPlayerLevel(event.target.value);}}/>
            </div>

            <div>
                Max Monsters: <input type="number" min="1" max="30" value={maxMonsters} onChange = {(event) => {setMaxMonsters(event.target.value)}} />
            </div>

            Difficulty
            <select onChange={(event) => {setDifficulty(event.target.value); localStorage.setItem("difficulty", difficulty)}} value = {difficulty}>
                <option value="0">Easy</option>
                <option value="1">Normal</option>
                <option value="2">Hard</option>
                <option value="3">Deadly</option>
            </select>
        </div>

        <div className="results-container">
            <MonsterTable environment="underground" max={maxMonsters} difficulty = {difficulty} charLevels={charLevels} adjust={compensate} seed = {seed}/>
        </div>
        
        </div>

}

export default MonsterGenerator;