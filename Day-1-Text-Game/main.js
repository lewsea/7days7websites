const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-buttons')

let state = {}

function startGame() {
  state = {}
  showTextNode(1)
  death()
}

function showTextNode(textNodeIndex) {
  const textNode = textNodes.find(textNode => textNode.id === textNodeIndex)
  textElement.innerText = textNode.text
  while (optionButtonsElement.firstChild) {
    optionButtonsElement.removeChild(optionButtonsElement.firstChild)
  }

  textNode.options.forEach(option => {
    if (showOption(option)) {
      const button = document.createElement('button')
      button.innerText = option.text
      button.classList.add('btn')
      button.addEventListener('click', () => selectOption(option))
      optionButtonsElement.appendChild(button)
    }
  })
}

function showOption(option) {
  return option.requiredState == null || option.requiredState(state)
}

function selectOption(option) {
  const nextTextNodeId = option.nextText
  if (nextTextNodeId <= 0) {
    return startGame()
  }
  state = Object.assign(state, option.setState)
  showTextNode(nextTextNodeId)
}

function death() {
  if (id = "death") {
    
  }
}

const textNodes = [
  {
    id: "death",
    text: '"YOU DIED"',
    options: [
      {
        text: 'Restart',
        nextText: -1
      }
    ]
  },
  {
    id: 1,
    text: 'Dark Souls Text Game',
    options: [
      {
        text: 'Start',
        nextText: 2
      },
      {
        text: 'Start (Dont)',
        nextText: "death"
      }
    ]
  },
  {
    id: 2,
    text: '"You wake up in a undead asylum and you see a corpse holding a key. What will you do ? "',
    options: [
      {
        text: 'Fight the undead near you',
        nextText: "death"
      },
      {
        text: 'Grab the key',
        nextText: 3
      }
    ]
  },
  {
    id: 3,
    text: '"You then proceed and see a bonfire nearby"',
    options: [
      {
        text: 'Lit the bonfire and rest',
        nextText: 4
      },
      {
        text: 'Ignore the bonfire',
        nextText: 5
      }
    ]
  },
  // {
  //   id: 3,
  //   text: '"Solve Fermats Last Theorem. zn>2n = xn + yn for n > 2 and (x,y) ∈ Z+ - {0}"',
  //   options: [
  //     {
  //       text: '420',
  //       nextText: 4
  //     },
  //     {
  //       text: '69',
  //       nextText: 5
  //     },
  //     {
  //       text: '3.14159265358979',
  //       nextText: 6
  //     },
  //     {
  //       text: 'No',
  //       nextText: 1
  //     }
  //   ]
  // },
  {
    id: 4,
    text: '"You are now well rested and you enter the large wooden double doors nearby."',
    options: [
      {
        text: 'Continue',
        nextText: 6
      }
    ]
  },
  {
    id: 5,
    text: '"You enter the large wooden double doors nearby unrested."',
    options: [
      {
      text: 'Continue',
      nextText: 6
      }
    ]
  },
  {
    id: 6,
    text: '"After entering the area you confront Asylum Demon a big and ugly looking demon which looks hard to deafeat, what will you do?"',
    options: [
      {
        text: 'Attack straight to his ugly face',
        nextText: "death"
      },
      {
        text: 'Run',
        nextText: 7
      },
      {
        text: 'Remove your weapon and fight him with fist',
        nextText: "death"
      }
    ]
  },
  {
    id: 7,
    text: '"After running from the Demon you find yourself at a long corridor. You then see an archer at the end."',
    options: [
      {
        text: 'Rush in to the archer',
        nextText: "death"
      },
      {
        text: 'Take cover in the left and grab a shield',
        nextText: 8
      }
    ]
  },
  {
    id: 8,
    text: '"You now have a shield which makes the archer turn tail and run."',
    options: [
      {
        text: 'Quickly sprint and bash the archer',
        nextText: 9
      },
      {
        text: 'Catch up with him later',
        nextText: 9
      }
    ]
  },
  {
    id: 9,
    text: '"You then head right and move slowly up the stairs and suddenly hear boulder rolling down to you."',
    options: [
      {
        text: 'Roll',
        nextText: 10
      },
      {
        text: 'What is a boulder',
        nextText: "death"
      }
    ]
  },
  {
    id: 10,
    text: '"The boulder then smashes the wall making way for a new area. You enter and see a wounded knight."',
    options: [
      {
        text: 'Hear him out',
        nextText: 11
      },
      {
        text: 'Poor knight if only he didnt took an arrow in the knee.',
        nextText: 11
      }
    ]
  },
  {
    id: 11,
    text: '"The knight then gives you Estus Flasks and Undead Asylum F2 Key before he die(RIP)."',
    options: [
      {
        text: 'Move on everybody dies',
        nextText: 12
      },
      {
        text: 'Ascend the stairs',
        nextText: 12
      }
    ]
  },
  {
    id: 12,
    text: '"There is a lone undead weilding a sword."',
    options: [
      {
        text: 'Kill him and pass through the gate.',
        nextText: 13
      },
      {
        text: 'Hahahaha fucking lonely ass nigga',
        nextText: 13
      }
    ]
  },
  {
    id: 13,
      text: '"You see an arsonist corpse vibing on your right holding Pyromancy Flame."',
      options: [
        {
          text: 'Show the gang sign and receive the Flame',
          nextText: 14
        }
      ]
  },
  {
    id: 14,
    text: '"Great you can now cast Katon 8 times (get ready big ugly ass demon)."',
    options: [{
      text: 'Practice your skills to the three undead near you',
      nextText: 15
    }]
  },
  {
    id: 15,
    text: 'Now that you’re better-equipped, you can now take revenge to the Asylum Demon earlier.',
    options: [
      {
        text: 'Go back to the Asylum Demon',
        nextText: 16
      },
      {
        text: 'Rethink all your life desicions and how it leads you this horrible situation.',
        nextText: 16
      }
    ]
  },
  {
    id: 16,
    text: 'So you didnt take the entrance earlier and now you are above the demon.',
    options: [
      {
        text: 'Do a plunge attack like ezio',
        nextText: 17
      },
      {
        text: 'Jump and say YOLO',
        nextText: "death"
      }
    ]
  },
  {
    id: 17,
    text: 'The Demon cripples from your plunge attack',
    options: [
      {
        text: 'Continue and kill the demon',
        nextText: 18
      },
      {
        text: 'Roll until he gives up',
        nextText: 18
      }
    ]
  },
  {
    id: 18,
    text: 'Victory is yours the demon is defeated and you gain one Humanity and a Key.',
    options: [
      {
        text: 'Use the key on the large blue door',
        nextText: 19
      },
      {
        text: 'Dwell in the past and regrets even though you cant change it'
      }
    ]
  },
  {
    id: 19,
      text: 'You are now outside the dungeon and the only thing here is a cliff (which is not bad).',
      options: [
        {
          text: 'Run toward to the end of cliff',
          nextText: 20
        },
        {
          text: 'Jump to the cliff',
          nextText: 20
        }
      ]
  }, 
  {
    id: 20,
      text: 'Congratulations you finish the first part of the game.',
      options: [
        {
          text: 'Go back',
          nextText: -1
        }
      ]
  }
]

startGame()