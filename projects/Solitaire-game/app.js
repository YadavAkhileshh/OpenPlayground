/* Import { createStore, combineReducers } from 'redux' */
const { createStore, combineReducers } = Redux;

/* Import { connect, Provider } from 'react-redux' */
const { connect, Provider } = ReactRedux;

/*********
* Constatants
**********/
const consts = {
  FOUNDATION: 'FOUNDATION',
  TABLEAU: 'TABLEAU',
  
  HEART: 'HEART',
  CLOVER: 'CLOVER',
  TILE: 'TILE',
  PIKE: 'PIKE'
}

/*********
* REACT
**********/
const Game = (() => {
  const UnconnectedGame = ({congratulation}) => (
    <div id='container'>
      <div className='header'>
        <Stock />
        <Foundation />    
      </div>
      <Tableau />
      <div className='congratulation' 
        style={{visibility: congratulation ? 'visible' : 'hidden'}}>
        <h1>Congratulation, you did it!</h1>
      </div>
    </div>
  );
  const mapStateToProps = (state, ownProps) => {
    return {
      congratulation: (
        state.foundation[0].cards.length === 13 && 
        state.foundation[1].cards.length === 13 &&
        state.foundation[2].cards.length === 13 &&
        state.foundation[3].cards.length === 13
      )
    }
  }
  
  return connect(mapStateToProps)(UnconnectedGame);
})();

const Stock = (() => {
  const UnconnectedStock = ({rest, flopped}) => (
    <div className='stock'>
      <div className='rest'>
        {rest.map(card => (
          <div className='cardContainer' 
            key={JSON.stringify({suit:card.suit,number:card.number})}>
            <Card key={JSON.stringify({suit:card.suit,number:card.number})}
              suit={card.suit} number={card.number} 
              stack={true} 
              turned={card.turned} locked={card.locked} last={false}/>
          </div>
        ))}
      </div>
      <div className='flop'>
        {flopped.map(card => (
          <div className='cardContainer'
            key={JSON.stringify({suit:card.suit,number:card.number})}>
            <Card key={JSON.stringify({suit:card.suit,number:card.number})}
              suit={card.suit} number={card.number} 
              stack={true} 
              turned={card.turned} locked={card.locked} last={card.last}/>
          </div>
        ))}
      </div>
    </div>
  );

  const mapStateToProps = (state, ownProps) => {
    return {
      rest: state.stock.rest,
      flopped: state.stock.flopped,
    }
  }
  
  return connect(mapStateToProps)(UnconnectedStock);
})();

const Foundation = (() => {
  const UnconnectedFoundation = ({piles}) => (
    <div className='foundation'>
      {piles.map((pile, pileIndex) => (
        <div className='pile' key={pileIndex}>
          {pile.cards.map(card => (
            <div className='cardContainer'
              key={JSON.stringify({suit:card.suit,number:card.number})}>
              <Card key={JSON.stringify({suit:card.suit,number:card.number})}
                suit={card.suit} number={card.number} 
                turned={card.turned} locked={card.locked} last={card.last}/>
            </div>
          ))}
          <DropSite key={JSON.stringify({type:consts.FOUNDATION,index:pileIndex})}
            pileType={consts.FOUNDATION} pileIndex={pileIndex} visible={pile.drop}/>
        </div>
      ))}
    </div>
  );

  const mapStateToProps = (state, ownProps) => {
    return {
      piles: state.foundation
    }
  }
  
  return connect(mapStateToProps)(UnconnectedFoundation);
})();

const Tableau = (() => {
  const UnconnectedTableau = ({piles}) => (
    <div className='tableau'>
      {piles.map((pile, pileIndex) => (
        <div className='pile' key={pileIndex}>
          {pile.cards.map((card, index) => (
            <div className='cardContainer'
              key={JSON.stringify({suit:card.suit,number:card.number})}>
              <Card key={JSON.stringify({suit:card.suit,number:card.number})}
                suit={card.suit} number={card.number} 
                stack={false} 
                turned={card.turned} locked={card.locked} last={card.last}/>
            </div>
          ))}
          <DropSite key={JSON.stringify({type:consts.TABLEAU,index:pileIndex})}
            pileType={consts.TABLEAU} pileIndex={pileIndex} visible={pile.drop}/>
        </div>
      ))}
    </div>
  );

  const mapStateToProps = (state, ownProps) => {
    return {
      piles: state.tableau
    }
  }
  
  return connect(mapStateToProps)(UnconnectedTableau);
})();


/*********
 * React: Card
 *********/
const Card = (() => {
  class UnconnectedCard extends React.Component {
    constructor({suit, number, stack, turned, locked, last}) {
      super({suit, number, stack, turned, locked, last});

      this.state = {
        rotation: turned ? 0 : -180
      };

      this.turn = this.turn.bind(this);
      this.dragStart = this.dragStart.bind(this);
      this.dragEnd = this.dragEnd.bind(this);
    }

    turn() {
      if(this.props.stack === true) {
        this.props.flop();
      }else{
        if(this.props.turned === true || this.props.locked) {
          return;
        }
        
        let lastTime = null;

        const slideBackAnimation = (time => {
          let rotation = null; 
          if(lastTime !== null) {
            const delta = (time - lastTime) * 0.4;
            rotation = Math.min(0, this.state.rotation + delta);
            this.setState({rotation});
          }
          lastTime = time;
          if(rotation !== 0) requestAnimationFrame(slideBackAnimation);
        }).bind(this);

        requestAnimationFrame(slideBackAnimation);
      }
    }

    dragStart(ev) {
      ev.dataTransfer.setData('text/plain', JSON.stringify({
        suit: this.props.suit,
        number: this.props.number
      }));
      this.props.dragStart();
    }

    dragEnd(ev) {
      this.props.dragEnd();
    }

    render() {
      let suit;
      switch(this.props.suit) {
        case consts.HEART:
          suit = <Heart />;
          break;
        case consts.TILE:
          suit = <Tile />;
          break;
        case consts.CLOVER:
          suit = <Clover />;
          break;
        case consts.PIKE:
          suit = <Pike />;
          break;
      }
      return (
        <div className='card'>
          <div className='cardFace frontFace' 
            style={{transform: `rotateY(${this.state.rotation}deg)`}}
            draggable={this.props.locked === false} 
            onDragStart={this.dragStart} 
            onDragEnd={this.dragEnd}>
            <div>
              <h1 className={this.props.suit}>{this.props.number}</h1>
              {suit}
            </div>
          </div>
          <div className={'cardFace backFace' + (this.props.locked === false ? ' pointer' : '')}
            style={{transform: `rotateY(${this.state.rotation+180}deg)`}}
            onClick={this.turn}/>
        </div>
      );
    }
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      dragStart: () => {
        dispatch({ 
          type: 'DRAG_START', 
          suit: ownProps.suit, 
          number: ownProps.number,
          last: ownProps.last
        });
      },
      dragEnd: () => {
        dispatch({ type: 'DRAG_END' });
      },
      flop: () => {
        dispatch({ type: 'FLOP' });
      },
    }
  }
  return connect(null, mapDispatchToProps)(UnconnectedCard);
})();

const Heart = ({zoom = false}) => (
  <svg className='suitIcon' 
    width={zoom === true ? 40 : 20} height={zoom === true ? 40 : 20} 
    viewBox='0 0 20 20'>
    <path className='heart' 
      d='
         M 0 6 
         A 2.5 2.5 0 0 1 10 6 
         A 2.5 2.5 0 0 1 20 6
         Q 16 14 10 19
         Q 4 14 0 6' />
  </svg>
);

const Tile = ({zoom = false}) => (
  <svg className='suitIcon'
    width={zoom === true ? 40 : 20} height={zoom === true ? 40 : 20} 
    viewBox='0 0 20 20'>
    <path className='tile' 
      d='
         M 10 0 
         Q 13 5 17 10 
         Q 13 15 10 20
         Q 7 15 3 10
         Q 7 5 10 0' />
  </svg>
);

const Clover = ({zoom = false}) => (
  <svg className='suitIcon'
    width={zoom === true ? 40 : 20} height={zoom === true ? 40 : 20} 
    viewBox='0 0 20 20'>
    <circle className='clover' cx='10' cy='5' r='4.5' />
    <circle className='clover' cx='5' cy='11' r='4.5' />
    <circle className='clover' cx='15' cy='11' r='4.5' />
    <polygon className='clover' points='10 10, 13 20, 7 20' />
  </svg>
);

const Pike = ({zoom = false}) => (
  <svg className='suitIcon'
    width={zoom === true ? 40 : 20} height={zoom === true ? 40 : 20} 
    viewBox='0 0 20 20'>
    <path className='pike' 
      d='
         M 0 12 
         A 2.5 2.5 0 0 0 10 12 
         A 2.5 2.5 0 0 0 20 12
         Q 16 4 10 0
         Q 4 4 0 12' />
    <polygon className='pike' points='10 10, 13 20, 7 20' />
  </svg>
);

/*********
 * React: Drop Site
 *********/
const DropSite = (() => {
  class UnconnectedDropSite extends React.Component {
    constructor({pileType, pileIndex, visible, drop}) {
      super({pileType, pileIndex, visible, drop});

      this.allowDrop = this.allowDrop.bind(this);
      this.drop = this.drop.bind(this);
    }

    allowDrop(ev) {
      ev.preventDefault();
    }

    drop(ev) {
      ev.preventDefault();
      let data = JSON.parse(ev.dataTransfer.getData("text"));
      this.props.drop(data.suit, data.number);
    }

    render() {
      return (
        <div className='dropTarget'
          style={{visibility: this.props.visible ? 'visible' : 'hidden'}}
          onDrop={this.drop} onDragOver={this.allowDrop}>
          <h1>
            +
          </h1>
        </div>
      );
    }
  }

  const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      drop: (suit, number) => {
        dispatch({ 
          type: 'DRAG_END' 
        });
        dispatch({ 
          type: 'DROP', 
          targetPileType: ownProps.pileType,
          targetPileIndex: ownProps.pileIndex, 
          suit, 
          number 
        });
      }
    }
  }
  return connect(null, mapDispatchToProps)(UnconnectedDropSite);
})();

/*********
* REDUX: Store
**********/
const store = (() => {
  let cards = (() => {
    function deck() {
      let cards = [];
      for(let i = 2; i <= 14; i++) {
        let number = i;
        if(i === 11) number = 'J';
        if(i === 12) number = 'Q';
        if(i === 13) number = 'K';
        if(i === 14) number = 'A';
        cards.push({suit: consts.HEART, number});
        cards.push({suit: consts.TILE, number});
        cards.push({suit: consts.CLOVER, number});
        cards.push({suit: consts.PIKE, number});
      }
      return cards;
    }

    function shuffle(a) {
      for (let i = a.length; i; i--) {
          let j = Math.floor(Math.random() * i);
          [a[i - 1], a[j]] = [a[j], a[i - 1]];
      }
    }

    let cards = deck();
    shuffle(cards);
    return cards;
  })();
  
  function pop(cards, turned = false) {
    if(turned) {
      return {...cards.shift(), turned: true, locked: false, last: true};
    }else{
      return {...cards.shift(), turned: false, locked: true, last: false};
    }
  }
  
  const initialState = {
    tableau: [
      {drop: false, cards: [pop(cards, true)]},
      {drop: false, cards: [pop(cards), pop(cards, true)]},
      {drop: false, cards: [pop(cards), pop(cards), pop(cards, true)]},
      {drop: false, cards: [pop(cards), pop(cards), pop(cards), pop(cards, true)]},
      {drop: false, cards: [pop(cards), pop(cards), pop(cards), pop(cards), pop(cards, true)]},
      {drop: false, cards: [pop(cards), pop(cards), pop(cards), pop(cards), pop(cards), pop(cards, true)]},
      {drop: false, cards: [pop(cards), pop(cards), pop(cards), pop(cards), pop(cards), pop(cards), pop(cards, true)]},
    ],
    stock: {
      rest: [...cards.map(card => ({
        suit: card.suit,
        number: card.number,
        turned: false,
        locked: false,
        last: false
      }))],
      flopped: [],
    },
    foundation: [
      {drop: false, cards: []},
      {drop: false, cards: []},
      {drop: false, cards: []},
      {drop: false, cards: []}
    ]
  };
  
  const stockReducer = (state = initialState.stock, action) => {
    switch (action.type) {
      case 'FLOP': {
        const rest = [
          ...state.flopped.map(
            card => ({
              suit: card.suit, 
              number: card.number, 
              turned: false, 
              locked: false
            })
          ), 
          ...state.rest
        ];
        
        let flopped = [];
        const first = rest.pop();
        const second = rest.pop();
        const third = rest.pop();
        if(third !== undefined) {
          flopped.push(Object.assign({}, third, {turned: true, locked: true, last: false}));
        } 
        if(second !== undefined) {
          flopped.push(Object.assign({}, second, {turned: true, locked: true, last: false}));
        }
        if(first !== undefined) {
          flopped.push(Object.assign({}, first, {turned: true, locked: false, last: true}));
        } 
        
        return {
          rest,
          flopped
        };
      }
      case 'DROP': {
        const topFlop = state.flopped[state.flopped.length - 1];
        if(topFlop !== undefined && topFlop.suit === action.suit && topFlop.number === action.number) {
          // The top of the flopped cards has been moved
          let flopped = [];
          if(state.flopped.length > 2) {
            flopped = flopped.concat(state.flopped.slice(0, -2));
          }
          if(state.flopped.length > 1) {
            flopped.push(Object.assign(
              {}, 
              state.flopped[state.flopped.length-2], 
              {
                locked: false,
                last: true
              }
            ));
          }
          return {
            rest: state.rest,
            flopped,
          };
           
        }
        return state;
      } 
      default: {
        return state;
      }
    }
  };
  
  const foundationReducer = (state = initialState.foundation, action) => {
    switch (action.type) {
      case 'DRAG_START': {
        if(action.last !== true) {
          return state;
        }
        function match(targetCard, draggedCard) {
          if(targetCard === undefined && draggedCard.number === 'A') {
            return true;
          }
          if(targetCard === undefined) {
            return false;
          }
          return (targetCard.suit === draggedCard.suit) && 
            (
              targetCard.number === 'A' && draggedCard.number === 2 ||
              targetCard.number === 10 && draggedCard.number === 'J' ||
              targetCard.number === 'J' && draggedCard.number === 'Q' ||
              targetCard.number === 'Q' && draggedCard.number === 'K' ||
              targetCard.number + 1 === draggedCard.number
            )
        }
        
        let draggedCard = {suit: action.suit, number: action.number};
        return state.map(
          pile => ({
            drop: match(pile.cards[pile.cards.length-1], draggedCard),
            cards: [...pile.cards]
          })  
        );
      }
      case 'DRAG_END': {
        return state.map(
          pile => ({
            drop: false,
            cards: [...pile.cards]
          })
        );
      }
      case 'DROP': {
        function match(card, suit, number) {
          return card !== undefined && card.suit === suit && card.number === number;
        }

        // Check if the moved card belonged to the foundation piles
        const sourcePileIndex = state.findIndex(
          pile => match(pile.cards[pile.cards.length-1], action.suit, action.number)
        );
        
        return state.map(
          (pile, pileIndex) => {
            // Add the card to the corresponding pile if the target is a foundation pile
            if(action.targetPileType === consts.FOUNDATION && action.targetPileIndex === pileIndex) {
              return {
                drop: false, 
                cards: [
                  ...pile.cards.map(
                    card => ({
                      suit: card.suit,
                      number: card.number,
                      turned: true,
                      locked: true,
                      last: false
                    })
                  ),
                  {
                    suit: action.suit, 
                    number: action.number, 
                    turned: true, 
                    locked: false, 
                    last: true
                  }
                ]
              };
            }
            // Remove the card from if it has been part of a foundation pile
            if(sourcePileIndex !== undefined && sourcePileIndex === pileIndex) {
              let cards = [];
              if(pile.cards.length > 2) {
                cards = cards.concat(pile.cards.slice(0,-2));
              }
              if(pile.cards.length > 1) {
                cards.push(Object.assign( {}, pile.cards[pile.cards.length-2], {locked: false,last: true} ));
              }
              return {
                drop: false, 
                cards
              };
            }
            // Return the pile unchanged if it has not been affected by the drop
            return pile;
          }
        );
      } 
      default: {
        return state;
      }
    }
  };
  
  const tableauReducer = (state = initialState.tableau, action) => {
    switch (action.type) {
      case 'DRAG_START': {
        function match(targetCard, draggedCard) {
          if(targetCard === undefined && draggedCard.number === 'K') {
            return true;
          }
          if(targetCard === undefined) {
            return false;
          }
          return (
            (
              targetCard.number === 'K' && draggedCard.number === 'Q' ||
              targetCard.number === 'Q' && draggedCard.number === 'J' ||
              targetCard.number === 'J' && draggedCard.number === 10 ||
              targetCard.number === draggedCard.number + 1
            ) && (
              (
                (targetCard.suit === consts.HEART || targetCard.suit === consts.TILE) && 
                (draggedCard.suit === consts.CLOVER || draggedCard.suit === consts.PIKE)
              ) ||
              (
                (targetCard.suit === consts.CLOVER || targetCard.suit === consts.PIKE) && 
                (draggedCard.suit === consts.HEART || draggedCard.suit === consts.TILE)
              )
            )
          );
        }
        
        let draggedCard = {suit: action.suit, number: action.number};
        return state.map(
          pile => ({
            drop: match(pile.cards[pile.cards.length-1], draggedCard),
            cards: [...pile.cards]
          })
        );
      }
      case 'DRAG_END': {
        return state.map(
          pile => ({
            drop: false,
            cards: [...pile.cards]
          })
        );
      }
      case 'DROP': {
        function match(card, suit, number) {
          return card !== undefined && card.suit === suit && card.number === number;
        }
        
        const [tableauWithoutMovingCards, movingCards] = state.reduce(
          (accumulated, currentPile) => {
            const index = currentPile.cards.findIndex(card => match(card, action.suit, action.number));
            if(index !== -1) {
              let cards = [];
              if(index > 1) {
                cards = cards.concat(currentPile.cards.slice(0, index - 1).map(
                  card => ({
                    suit: card.suit,
                    number: card.number,
                    turned: card.turned,
                    locked: card.locked,
                    last: false
                  })
                ));
              }
              if(index > 0) {
                cards.push(Object.assign( {}, currentPile.cards[index - 1], {
                  locked: false,
                  last: true
                } ));
              }
              accumulated[0].push({
                drop: false, 
                cards
              });
              accumulated[1] = currentPile.cards.slice(index).map(
                card => ({
                  suit: card.suit,
                  number: card.number,
                  turned: true,
                  locked: false,
                  last: card.last
                })
              );
            }else{
              accumulated[0].push(currentPile);
            }
            return accumulated;
          },
          [
            [
              // Tableau without moving cards
            ],
            [
              // Moving cards default (overwritten if source found in a tableau pile)
              {
                suit: action.suit, 
                number: action.number,
                turned: true,
                locked: false,
                last: true
              }
            ]  
          ]
        );
        if(action.targetPileType === consts.TABLEAU) {
          tableauWithoutMovingCards[action.targetPileIndex] = {
            drop: false,
            cards: tableauWithoutMovingCards[action.targetPileIndex].cards.map(
              card => ({
                suit: card.suit,
                number: card.number,
                turned: card.turned,
                locked: card.locked,
                last: false
              })
            ).concat(movingCards)
          };
          return tableauWithoutMovingCards;
        }
        return tableauWithoutMovingCards;
      } 
      default: {
        return state;
      }
    }
  };

  const mainReducer = combineReducers({
    stock: stockReducer,
    foundation: foundationReducer,
    tableau: tableauReducer
  });

  return createStore(mainReducer);
})();


/*********
 * React DOM
 *********/
ReactDOM.render(
  <Provider store={store}>
    <Game />
  </Provider>,
  document.getElementById('app')
);