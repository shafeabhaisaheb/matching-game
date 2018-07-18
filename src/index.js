import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Card extends React.Component {

	render() {

		var url = this.props.img;

		let className = "card";
		return (

			/* if card is hidden, apply 'card' and 'check' classes. if flipped, check to see if matched. */
			<div class="container">
					<div className={(!this.props.hidden) 
									? ((this.props.matched) 
										? (className += ' flipcard matched') 
										: (className += ' flipcard')) 
									: (className += ' check')} 
									onClick={() => this.props.onClick()}>
						<div class="side">
							<img src="img/bg4.png" />
						</div>
						<div class="side back">
							<img src={url} />
						</div>
					</div>
				</div>
		);

	}
}

class Board extends React.Component {

	constructor(props) {
		super(props);

		/*Two cards for each value, intially face down*/

		const cards = new Array(
			{value:"Pooh", img:"img/pooh.png", hidden:true, matched:false}, 
			{value:"Pooh", img:"img/pooh.png", hidden:true, matched:false}, 
			{value:"Roo", img:"img/roo.png", hidden:true, matched:false}, 
			{value:"Roo", img:"img/roo.png", hidden:true, matched:false}, 
			{value:"Tigger", img:"img/tigger.png", hidden:true, matched:false}, 
			{value:"Tigger", img:"img/tigger.png", hidden:true, matched:false},
			{value:"Eeyore", img:"img/eeyore.png", hidden:true, matched:false}, 
			{value:"Eeyore", img:"img/eeyore.png", hidden:true, matched:false}, 
			{value:"Piglet", img:"img/piglet.png", hidden:true, matched:false}, 
			{value:"Piglet", img:"img/piglet.png", hidden:true, matched:false}, 
			{value:"Owl", img:"img/owl.png", hidden:true, matched:false}, 
			{value:"Owl", img:"img/owl.png", hidden:true, matched:false}
		);

		/* Three main game states: waiting to flip first card, waiting to flip second card, and wrong guess */

		const states = {
			flipfirst:"Flip First Card",
			flipsecond: "Flip Second Card",
			wrong: "Wrong Choice"
					};

		/*State for Board component. Initalize begin to true to call shuffle*/

		this.state = {
			cards: cards,
			gameState: states.flipfirst,
			begin:true,
			victory:false,
			firstCard: null,
			secondCard: null,
			firstIndex: null,
			secondIndex: null
		}
	}

	/* randomly shuffles the cards array. called at the start of each game. */

	shuffle(cards) {
		let i = 0;
		let j = 0;
		let temp = null;

		for(i=cards.length - 1; i>0; i--) {
			j = Math.floor(Math.random() * (i+1));
			temp = cards[i];
			cards[i] = cards[j];
			cards[j] = temp;
		}
		/*set newly shuffled card array as state. begin is false so shuffle will not occur at each turn */

		this.setState({cards:cards, begin:false});
	}

	/* each click of a card is handled by handleClick(i). it is passed the index of the card clicked in the cards array */

	handleClick(i) {

		/* retaining immutability of cards array by creating new array*/
		const cards = this.state.cards.slice();
		const card = cards[i];

		/* player should not be able to click a card that is already face up, ie. hidden = false */
		if(card.hidden) {

			/*each turn updates the game state*/
			switch(this.state.gameState) {
				case "Flip First Card":
					/* clicked card is flipped by calling flipCard which sets its state to hidden = false */
					this.flipCard(i);
					/* store value of first card to compare with second next turn */
					this.setState({firstCard:card.value, firstIndex:i, gameState:"Flip Second Card"});
					break;

				case "Flip Second Card":
					/* clicked card is flipped and then compared to stored first card value */
					this.flipCard(i);
					if(this.state.firstCard === card.value) {
						/*if it's a match, check to see if any more cards need to be found*/
						if(!this.checkWin()) {
						this.setState({gameState:"Flip First Card"});
						}
						this.setMatched(this.state.firstIndex);
						this.setMatched(i);
						
					}
					else {
						/*if not a match, save second card so we can hide it again */
						this.setState({secondCard:card.value, secondIndex:i, gameState:"Wrong Choice"});
					}

					break;

				case "Wrong Choice":
					/*hide both first and second cards*/
					this.flipCard(this.state.firstIndex);
					this.flipCard(this.state.secondIndex);
					/* immediately flip the next card clicked after wrong flip, set it as new first card */
					this.flipCard(i);
					this.setState({firstCard:card.value, firstIndex:i, secondCard:null, secondIndex:null, gameState:"Flip Second Card"});
					break;
			}
		}
	}

    /* flip a hidden card over and update state. maintain immutability */
	flipCard(i) {
		
		const cards = this.state.cards.slice();
		cards[i].hidden = !cards[i].hidden;	
		this.setState({cards:cards});
	}

	setMatched(i) {
		
		const cards = this.state.cards.slice();
		cards[i].matched = true;	
		this.setState({cards:cards});
	}

    /*check if all cards have been found, none remain hidden*/

	checkWin() {
		const cards = this.state.cards.slice();
		let flag = 0;
			for(let i=0; i<cards.length;i++) {
				if(cards[i].hidden) {
					flag = 1;
				}
			}

			if(flag === 0) {
				{this.props.declareVictory()}
				this.setState({victory: true});
				return true;
			}
			else return false;
	}

	render() {

		let cards = this.state.cards.slice();
		/*if board component has just rendered (game has begun) shuffle the cards*/
		if(this.state.begin) {
			console.log("Shuffling...");
			this.shuffle(cards);
		}

		/*map each card element and pass the value, hidden, index, and handle click function to Card component*/

		const listCards = cards.map((card, index) => <Card card={card.value} img={card.img} hidden={card.hidden} matched={card.matched} onClick={()=>this.handleClick(index)} />);
		    return (
		      <div>
		        <div className="instructions">Can you find Pooh and his friends in the Hundred Acre Woods? {this.state.victory}</div>
		        <div className={this.state.victory? "greyed board-row" : "board-row"}>
		         	{listCards}
		        </div>
		      </div>
		    );
  }

}

/* Each new game */

class Game extends React.Component {

  constructor(props) {
  	super(props);

  	this.handleReplay = this.handleReplay.bind(this);
  	this.handleWin = this.handleWin.bind(this);
  	this.state = {
  		startover:false,
  		victory:false
  	};
  }

  handleReplay() {
  	this.setState({startover:!this.state.startover, victory: false});
  }

  handleWin() {
  	this.setState({victory: !this.state.victory});
  }


  render() {

  	if(!this.state.startover) {
  		return(
  			<div className="game">
  				<div><Board action={this.handleReplay} declareVictory={this.handleWin} /></div>
  				<div className={!this.state.victory? "modal" : "hide"}>Wonderful!<br /><button onClick={this.handleReplay}>Once more?</button><br /><img src="img/testpooh.gif"/></div>
  			</div>
  		);
  	}

  	else {
  		return (
  		<div className="game">
  				<div></div>
  				<div><Board action={this.handleReplay} declareVictory={this.handleWin} /></div>
  				<div className={!this.state.victory? "modal" : "hide"}>Wonderful!<br /><button onClick={this.handleReplay}>Once more?</button></div>
  			</div>
  		);
  	}

  }
}

ReactDOM.render(
	<Game />,
	document.getElementById('root'));
