import { useEffect } from "react";
//import tsv from './kfc.tsv'
import React from 'react'
import Papa from 'papaparse'
import Random from 'random-seed'

const crToXP = new Map();
crToXP.set("0", 10)
crToXP.set("1/8", 25)
crToXP.set("1/4", 50)
crToXP.set("1/2", 100)
crToXP.set("1", 200)
crToXP.set("2", 450)
crToXP.set("3", 700)
crToXP.set("4", 1100)
crToXP.set("5", 1800)
crToXP.set("6", 2300)
crToXP.set("7", 2900)
crToXP.set("8", 3900)
crToXP.set("9", 5000)
crToXP.set("10", 5900)
crToXP.set("11", 7200)
crToXP.set("12", 8400)
crToXP.set("13", 10000)
crToXP.set("14", 11500)
crToXP.set("15", 13000)
crToXP.set("16", 15000)
crToXP.set("17", 18000)
crToXP.set("18", 20000)
crToXP.set("19", 22000)
crToXP.set("20", 25000)
crToXP.set("21", 33000)
crToXP.set("22", 41000)
crToXP.set("23", 50000)
crToXP.set("24", 62000)
crToXP.set("30", 155000)


const monsterTable = (props) => {
    console.log("draw monster table")
    const [rows, setRows] = React.useState([])
    const [byCR, setByCR] = React.useState([])
    const [environment, setEnvironment] = React.useState(new Map())
    //from https://makeaskillcheck.com/5e-how-does-cr-work/
    const xpByCharLevel = [
      [0, 0, 0, 0]
      , [25, 50, 75, 100]//1
      , [50, 100, 150, 200]
      , [75, 150, 225, 400]
      , [125, 250, 375, 500]
      , [250, 500, 750, 1100]
      , [300, 600, 900, 1400]
      , [350, 750, 1100, 1700]
      , [450, 900, 1400, 2100]//8
      , [550, 1100, 1600, 2400]
      , [600, 1200, 1900, 2800]//10
      , [800, 1600, 2400, 3600]
      , [1000, 2000, 3000, 4500] 
      , [1100, 2200, 3400, 5100]
      , [1250, 2500, 3800, 5700]
      , [1400, 2800, 4300, 6400]
      , [1600, 3200, 4800, 7200]
      , [2000, 3900, 5900, 8800]
      , [2100, 4200, 6300, 9500]
      , [2400, 4900, 7300, 10900]
      , [2800, 5700, 8500, 12700]//20
  ]

    const multipliers = [1, 1, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 2.5, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4]

    React.useEffect(() => {
    async function getData() {
      const response = await fetch('/kfc.tsv')
      //console.log(response.text)
      const reader = response.body.getReader()
      const result = await reader.read() // raw array
      const decoder = new TextDecoder('utf-8')
      const csv = decoder.decode(result.value) // the csv text
      const results = Papa.parse(csv, { header: true }) // object with { data, errors, meta }
      const rowsV = results.data// array of objects
      const environments = new Map();
      
      rowsV.map((e) => {
        if (!e.environment) return
        const envs = e.environment.split(",")
        envs.map((en) => {
          en = en.replace(/\s/g, '')
          if (!environments.has(en)){
            var newArr = new Array();
            environments.set(en, newArr);
            // console.log ( "new " + en + environments.get(en)[5] )
          }
          
          //console.log ( "write " + en )
          //console.log ( "write " + e.cr )
          e.xp = crToXP.get(e.cr);
          if (en) environments.get(en).push(e)
          //if (!e) console.log("error")

        })
      })
      setRows(rowsV)
      setEnvironment(environments)
      
    }
    getData()
   // setInterval(() => {console.log(rows)}, 2000)
  }, []) // [] means just do this once, after initial render

  
  var xpTargets = [0,0,0,0];
  for (var i = 0; i < props.charLevels.length; i++){
    for (var t = 0; t < 4; t++){
      xpTargets[t] += xpByCharLevel[props.charLevels[i]][t];
      //console.log("mul " + xpTargets[t] )
    }
    //console.log(" ")
  }
  const [xp, setXP] = React.useState(0)
  const [list, setList] = React.useState([])
  React.useEffect(() => {
    console.log("recalc list" + (environment == null))
    var list = [];
    var xp = 0;
    var done = false;
    var env = environment.get(props.environment);
    var tries = 0;
    var random = Random.create(props.seed)
  
    while (env && !done && tries++ < 10000){
      var index = random(env.length)
      var mon = env[Math.floor(index)]
      //console.log("try " + index + " " + env.length)
      if (mon.xp > xpTargets[props.difficulty] - xp * (props.adjust?multipliers[list.length+1]:1))
        continue;
      else {
        list.push(mon);
        xp += mon.xp;
        while (xp * (props.adjust?multipliers[list.length]:1) > xpTargets[props.difficulty] || list.length > props.max){
          var diff = xp * (props.adjust?multipliers[list.length]:1) - xpTargets[props.difficulty]
          //remove smallest xp larger than diff
          var smallest = 1000000;
          var smallestI = -1;
          for (var i = 0; i < list.length; i++){
            var m = list[i];
            if (m.xp < smallest){
              smallest = m.xp;
              smallestI = i;
            }
          }
          //console.log("remove " + list.length)
          xp -= list[smallestI].xp;
          list.splice(smallestI, 1);
        }
        if (xp * (props.adjust?multipliers[list.length]:1) > xpTargets[props.difficulty] * 0.8)
          done = true;
      }
    }
    setXP(xp)
    setList(list)
  }, [ props.charLevels, props.seed, props.max, environment]);

  
  


  const copyMonster = (e) => {
    const newList = list.map((el) => {
      return el
    })
    newList.push(list[e.target.id])
    setList(newList);
    console.log("copy monster " + e.target.id)
  }
  const removeMonster = (e) => {
    const newList = list.map((el) => {
      return el
    })
    newList.splice(e.target.id, 1)
    setList(newList);
    console.log("copy monster " + e.target.id)
  }

  var i =0;
  var monsters = list.map((e) => {
    const el = <div  key={i}>{e.name} ({e.xp}) <button id={i} onClick={copyMonster}>+</button> <button id={i} onClick={removeMonster}>-</button></div>
    i++
    return el
  })
  const progressValue = [0,0,0,0]
  for (var i = 0; i < 4; i++){
    progressValue[i] = xp * (props.adjust?multipliers[list.length]:1)
  }
  return <div >
      XP: {xp} * {(props.adjust?multipliers[list.length]:1)} = {xp * (props.adjust?multipliers[list.length]:1)} / {xpTargets[props.difficulty]}
      
      
      {monsters}
      <div>
        XP: {xp}
      </div>

      <div className = "flex-container">
        <div className="column-container">
          <meter max={xpTargets[0]} min = {0} value={progressValue[0]}></meter>
          Easy
        </div>
        <div className="column-container">
          <meter max={xpTargets[1]} min = {xpTargets[0]} value={progressValue[1]}></meter>
          Normal
        </div>
        <div className="column-container">
          <meter max={xpTargets[2]} min = {xpTargets[1]} value={progressValue[2]}></meter>
          Hard
        </div>
        <div className="column-container">
          <meter max={xpTargets[3]} min = {xpTargets[2]} value={progressValue[3]}></meter>
          Deadly
        </div>
      </div>
      
      
      
  </div>
    
}

export default monsterTable;