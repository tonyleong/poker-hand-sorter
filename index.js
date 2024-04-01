const readline = require('readline');
const fs = require('fs');

const numbers = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
const suits = ['D', 'H', 'S', 'C']
const fileName = './poker-hands.txt'

const main = async () => {
  try {
    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    let score = { 1: 0, 2: 0 }
    for await (const line of rl) {
      let winner = getWinner(line)
      if (winner !== null) score[winner]++
    }
    console.log('Player 1: ', score[1])
    console.log('Player 2: ', score[2])
  } catch (error) {
    console.log(error)
  }
}

const getWinner = (line) => {
  let array = line.split(' ')
  let player1 = array.slice(0, 5)
  let player2 = array.slice(5, 10)
  player1 = sortAndValidation(player1)
  player2 = sortAndValidation(player2)
  let p1Rank = getRank(player1)
  let p2Rank = getRank(player2)
  while (p1Rank.rank === p2Rank.rank && p1Rank.highestValue === p2Rank.highestValue) {
    if (p1Rank.rank !== 1) {
      p1Rank = getRank(player1, p1Rank.rank)
      p2Rank = getRank(player2, p2Rank.rank)
    } else {
      p1Rank = getRank(player1, p1Rank.rank, p1Rank.highestValue)
      p2Rank = getRank(player2, p2Rank.rank, p2Rank.highestValue)
    }
  }
  let p1HvIndex = numbers.findIndex(n => n === p1Rank.highestValue)
  let p2HvIndex = numbers.findIndex(n => n === p2Rank.highestValue)
  if (p1Rank.rank > p2Rank.rank) return 1
  else if (p1Rank.rank < p2Rank.rank) return 2
  else if (p1Rank.rank === p2Rank.rank && p1HvIndex > p2HvIndex) return 1
  else if (p1Rank.rank === p2Rank.rank && p1HvIndex < p2HvIndex) return 2
  //else is tie, then no one be the winner
}

const sortAndValidation = (set) => {
  set = set.sort((a, b) => {
    let aNumberIndex = numbers.findIndex(n => n === a[0])
    let bNumberIndex = numbers.findIndex(n => n === b[0])
    let aSuitIndex = suits.findIndex(n => n === a[1])
    let bSuitIndex = suits.findIndex(n => n === b[1])
    //Number and suits validation
    if (aNumberIndex === -1 || bNumberIndex === -1) throw new Error('Invalid Input, wrong number')
    if (aSuitIndex === -1 || bSuitIndex === -1) throw new Error('Invalid Input, wrong suit')
    return aNumberIndex - bNumberIndex
  })

  return set
}

const getRank = (set, sameRank = 11, hv) => {


  let sameSuit = true
  let numberMatched = true
  let numberInOrder = true
  let suit = ''
  let numberIndex = -1
  let numberSet = {}

  for (let i = 0; i < set.length; i++) {
    let card = set[i]
    let currentNumber = card[0]
    let currentSuit = card[1]

    //Suit check
    if (sameSuit === true) {
      if (i === 0) suit = currentSuit
      else if (suit !== currentSuit) {
        sameSuit = false
      }
    }


    //royal flush numbers Check
    if (numberMatched === true) {
      let numberCheck = ['T', 'J', 'Q', 'K', 'A'].includes(currentNumber)
      if (!numberCheck) {
        numberMatched = false
      }
    }

    //numbers in order
    if (numberInOrder === true) {
      let currentNumberIndex = numbers.findIndex(n => n === currentNumber)
      if (i === 0 || currentNumberIndex === numberIndex + 1) numberIndex = currentNumberIndex
      else if (currentNumberIndex !== numberIndex + 1) {
        numberInOrder = false
      }
    }

    if (numberSet[currentNumber] === undefined) numberSet[currentNumber] = 1
    else numberSet[currentNumber]++
  }


  if (sameSuit && numberMatched && sameRank > 10) return { rank: 10, highestValue: set[4][0] } //royal flush
  if (sameSuit && numberInOrder && sameRank > 9) return { rank: 9, highestValue: set[4][0] } //straight flush

  let fourOfAKind = Object.entries(numberSet).find(([key, n]) => n === 4)
  let threeOfAKind = Object.entries(numberSet).find(([key, n]) => n === 3)
  let pair = Object.entries(numberSet).find(([key, n]) => n === 2)

  if (fourOfAKind && sameRank > 8) return { rank: 8, highestValue: fourOfAKind[0] } // four of a kind
  if (threeOfAKind && pair && sameRank > 7) return { rank: 7, highestValue: threeOfAKind[0] } // full house
  if (sameSuit && sameRank > 6) return { rank: 6, highestValue: set[4][1] }
  if (numberInOrder && sameRank > 5) return { rank: 5, highestValue: set[4][0] }//straight
  if (threeOfAKind && sameRank > 4) return { rank: 4, highestValue: threeOfAKind[0] } // three of a kind
  let twoPairsArray = Object.entries(numberSet).filter(([key, n]) => n === 2)
  if (twoPairsArray.length === 2 && sameRank > 3) return { rank: 3, highestValue: twoPairsArray[1][1][0] } // two pairs
  if (pair && sameRank > 2) return { rank: 2, highestValue: pair[0] } // pair

  let highestValue = set[4][0]
  let hvIndex = numbers.findIndex(n => n === hv)
  let highestValueIndex = numbers.findIndex(n => n === highestValue)
  if (hv !== undefined && highestValueIndex >= hvIndex) {
    for (let i = 4; i >= 0; i--) {
      highestValueIndex = numbers.findIndex(n => n === set[i][0])
      if (highestValueIndex < hvIndex) {
        highestValue = set[i][0]
        break
      }
    }
  }

  return { rank: 1, highestValue }
}



main()
// getScore('2H 2D 4C 4D 4S 3C 3D 3S 9S 9D')
// let testArr = ['TD', 'JD', 'QD', 'KD', '9H']
// let testArr = ['TD', 'JD', 'QD', 'KD', '8D']
// let testArr = ['TD', 'TH', 'TS', '9D', '9H']
// let testArr = ['3D', '3H', '2S', '2D', '8H']
// let test = getRank(testArr)
// console.log(test)
