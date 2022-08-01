import React, { useState,useEffect } from 'react'
import 'semantic-ui-css/semantic.min.css'
import { Grid,Image,Header,Button } from 'semantic-ui-react'
import axios from "axios"
import './App.css'

function App() {
  const [cards, setCards] = useState([]),[score, setScore] = useState(0),[tries, setTries] = useState(3)
  function hasDuplicate(a,b) {
    let chk = false
    a.forEach((e1)=>{
      b.forEach((e2)=>{
        if (e1.code == e2.code) chk = true
      })
    })
    return chk
  }
  const draw = async () => {
    if (tries<=0) return false
    try {
      const res = await axios.get('https://deckofcardsapi.com/api/deck/new/draw?count=5')
      let newCards = [...res.data.cards]
      newCards.forEach((card)=>{
        card.choosed = false
      })
      if (cards.length == 0) {
        setCards(newCards)
      } else {
        while (hasDuplicate(cards,newCards)) {
          const resPrime = await axios.get('https://deckofcardsapi.com/api/deck/new/draw?count=5')
          newCards = [...resPrime.data.cards]
        }
        newCards.forEach((card,idx)=>{
          if (cards[idx].choosed) newCards[idx] = cards[idx]
        })
        setCards(newCards)
        setTries(tries-1)
      }
    } catch (err) {
      console.error(err)
    }
  }
  if (cards.length == 0) {
    draw()
  }
  const clickCard = (number) => {
    const newCards = [...cards]
    newCards[number].choosed = ! newCards[number].choosed
    setCards(newCards)
  }
  const cardImages = cards.map((card,idx)=>
  <Grid.Column key={idx}>
    <Image src={card.image} onClick={()=>{clickCard(idx)}} className={`cardImage ${card.choosed?'choosed':''}`}/>
  </Grid.Column>
  )
  const calcScore = (cards) => {
    if (cards.length == 0) return 0
    let res = 0
    const a = [], b = []
    cards.forEach((card)=>{
      a.push(card.code.substring(0,card.code.length-1))
      b.push(card.code.substring(card.code.length-1))
    })
    const scoreTable1 = {A:20,J:11,Q:12,K:13,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,0:10}
    a.forEach((st)=>{
      res+=scoreTable1[st]
    })
    console.log(res)
    const scoreTable2 = {S:0,H:0,D:0,C:0}
    b.forEach((st)=>{
      scoreTable2[st]++
    })
    for(const el in scoreTable2) {
      if(scoreTable2[el]==3) res += 30
      if(scoreTable2[el]==4) res += 40
      if(scoreTable2[el]==5) res += 100
    }
    console.log(a,b,scoreTable1,scoreTable2,res)
    return res
  }
  useEffect(()=>{
    setScore(calcScore(cards))
  })
  const restart = ()=>{
    return null
  }
  return(
    <div className="App">
      <Header id='title'>boardnites</Header>
      <div class='mid'>
        score:{score} tries:{tries}<br/><br/>
        <Button onClick={tries>0?()=>draw():restart()}>{tries>0?'draw':'restart'}</Button>
      </div>
      <Grid columns={5} className='cards' divided>{cardImages}</Grid>
    </div>
  )
}

export default App
