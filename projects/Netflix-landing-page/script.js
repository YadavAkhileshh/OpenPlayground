/////////////////
/// COMPONENTS //
/////////////////

// Container
var App = React.createClass({
	apiKey: '87dfa1c669eea853da609d4968d294be',
	getInitialState: function() {
		return {data: []};
	},
	performSearch: function(e) {
		// stop form from submitting
		e.preventDefault();
		
		// get the value
		var val = $('.Search input').val();
		
		// Do the thing
		var requestUrl = 'https://api.themoviedb.org/3/search/multi?query=' + val + '&api_key=' + this.apiKey;
		
		$.ajax({
      url: requestUrl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
		
	},
	componentDidUpdate: function() {
	
	},
	render: function() {
		
		if(this.state.data.results) {
			console.log(this.state.data);
		}
		
		return (
			<div>
				<Header onSubmit={this.performSearch} />
				<Hero />
				<TitleList title="Top TV picks for Jack" url='discover/tv?sort_by=popularity.desc&page=1' />
				<TitleList title="Trending now" url='discover/movie?sort_by=popularity.desc&page=1' />
				<TitleList title="Most watched in Horror" url='genre/27/movies?sort_by=popularity.desc&page=1' />
				<TitleList title="Sci-Fi greats" url='genre/878/movies?sort_by=popularity.desc&page=1' />
				<TitleList title="Comedy magic" url='genre/35/movies?sort_by=popularity.desc&page=1' />
			</div>
		);
	}
});

////////////
// Header //
////////////

var Header = React.createClass({
	render: function() {
		return (
			<header className="Header">
				<Logo />
				<Navigation />
				<Search onSubmit={this.props.onSubmit} />
				<UserProfile />
			</header>
		);
	}
});

// Logo
var Logo = React.createClass({
	render: function() {
		return (
			<div id="logo" className="Logo">
				<svg version="1.1" width="300" height="81.386726" id="svg3262">
					<g transform="translate(-384.28572,-428.81172)" id="layer1">
						<g transform="matrix(2.5445375,0,0,2.5445375,1157.1714,-1457.8678)" id="g3235">
							<path d="m -203.09972,771.41415 c 1.6425,0.15875 3.2825,0.33 4.92,0.5075 l 3.615,-8.92625 3.43625,9.74875 c 1.76375,0.22125 3.525,0.4525 5.2825,0.695 l -6.02375,-17.09625 6.02625,-14.88 -5.10375,0 -0.0525,0.0725 -3.255,8.03875 -2.8575,-8.11125 -5.03875,0 5.2025,14.7625 -6.15125,15.18875 z" id="path3015" style={{fill:'#b81d24', fillOpacity: 1, fillRule:'nonzero', stroke:'none'}} />
							<path d="m -206.91147,771.06478 0,-29.60125 -5.0375,0 0,29.18625 c 1.68125,0.12875 3.36125,0.26875 5.0375,0.415" id="path3019" style={{fill:'#b81d24', fillOpacity: 1, fillRule:'nonzero', stroke:'none'}} />
							<path d="m -244.7486,769.4089 c 1.36,0 2.7175,0.01 4.07375,0.0213 l 0,-10.875 6.05125,0 0,-4.63125 -6.05125,0 0,-7.825 6.96875,0 0,-4.63625 -12.02625,0 0,27.95 c 0.3275,0 0.655,-0.004 0.98375,-0.004" id="path3023" style={{fill:'#b81d24', fillOpacity: 1, fillRule:'nonzero', stroke:'none'}} />
							<path d="m -260.3881,769.69191 c 1.6775,-0.06 3.3575,-0.11 5.04,-0.15125 l 0,-23.44125 4.7075,0 0,-4.63625 -14.45625,0 0,4.63625 4.70875,0 0,23.5925 z" id="path3035" style={{fill:'#b81d24', fillOpacity: 1, fillRule:'nonzero', stroke:'none'}} />
							<path d="m -298.91059,772.81378 0,-17.63625 5.96375,16.92375 c 1.83375,-0.20625 3.67125,-0.4 5.5125,-0.5825 l 0,-30.055 -4.8325,0 0,18.2675 -6.43625,-18.2675 -0.2075,0 -4.8325,0 0,31.98375 0.03,0 c 1.5975,-0.22125 3.19875,-0.43125 4.8025,-0.63375" id="path3039" style={{fill:'#b81d24', fillOpacity: 1, fillRule:'nonzero', stroke:'none'}} />
							<path d="m -269.95297,746.09903 0,-4.63625 -12.0275,0 0,24.9125 0,4.6375 0,0.004 c 3.99125,-0.345 7.99625,-0.63375 12.0175,-0.86875 l 0,-0.004 0,-1.33625 0,-3.3 c -2.325,0.135 -4.645,0.29125 -6.96,0.46375 l 0,-7.415 6.05125,0 0,-4.63375 -6.05125,0 0,-7.82375 6.97,0 z" id="path3051" style={{fill:'#b81d24', fillOpacity: 1, fillRule:'nonzero', stroke:'none'}} />
							<path d="m -223.72272,765.2864 0,-23.82375 -5.05875,0 0,23.605 0,4.63625 0,0.005 c 4.02375,0.1475 8.0325,0.35375 12.0275,0.6125 l 0,-0.006 0,-1.4975 0,-3.13875 c -2.31875,-0.15 -4.64125,-0.28 -6.96875,-0.3925" id="path3055" style={{fill:'#b81d24', fillOpacity: 1, fillRule:'nonzero', stroke:'none'}} />
						</g>
					</g>
				</svg>
			</div>
		);
	}
});

// Navigation
var Navigation = React.createClass({
	render: function() {
		return (
			<div id="navigation" className="Navigation">
				<nav>
					<ul>
						<li>Browse</li>
						<li>My list</li>
						<li>Top picks</li>
						<li>Recent</li>
					</ul>
				</nav>
			</div>
		);
	}
});

// Search
var Search = React.createClass({
	render: function() {
		return (
			<form onSubmit={this.props.onSubmit} id="search" className="Search">
				<input type="search" placeholder="Search for a title..." />
			</form>
		);
	}
});

// User Profile
var UserProfile = React.createClass({
	render: function() {
		return (
			<div className="UserProfile">
				<div className="User">
					<div className="name">Jack Oliver</div>
					<div className="image"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/557257/profile/profile-512_1.jpg" /></div>
				</div>
				<div className="UserProfile-menu">
					<div className="UserProfileSwitch">
						<ul>
							<li>
								<div className="UserProfile-image">
									<img src="http://lorempixel.com/96/96" />
								</div>
								<div className="UserProfile-name">
									Alexander
								</div>
							</li>
							<li>
								<div className="UserProfile-image">
									<img src="http://lorempixel.com/96/96" />
								</div>
								<div className="UserProfile-name">
									Mattias
								</div>
							</li>
						</ul>
					</div>
					<div className="UserNavigation">
						<ul>
							<li>Your Account</li>
							<li>Help Center</li>
							<li>Sign out of Netflix</li>
						</ul>
					</div>
				</div>
			</div>
		);
	}
});

//////////
// Hero //
//////////

var Hero = React.createClass({
	render: function() {
		return (
			<div id="hero" className="Hero" style={{backgroundImage: 'url(https://images.alphacoders.com/633/633643.jpg)'}}>
				<div className="content">
					<img className="logo" src="http://www.returndates.com/backgrounds/narcos.logo.png" alt="" />
					<h2>Season 2 now available</h2>
					<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque id quam sapiente unde voluptatum alias vero debitis, magnam quis quod.</p>
					<div className="button-wrapper">
						<HeroButton primary={true} text="Watch now" />
						<HeroButton primary={false} text="+ My list" />
					</div>
				</div>
				<div className="overlay"></div>
			</div>
		);
	}
})

// Hero Button
var HeroButton = React.createClass({
	render: function() {
		return (
			<a href="#" className="Button" data-primary={this.props.primary}>{this.props.text}</a>
		);
	}
})

////////////////
// Title List //
////////////////

// Title List Container

var TitleList = React.createClass({
	apiKey: '87dfa1c669eea853da609d4968d294be',
	getInitialState: function() {
		return {data: [], mounted: false};
	},
	loadContent: function() {
		var requestUrl = 'https://api.themoviedb.org/3/' + this.props.url + '&api_key=' + this.apiKey;
		
		$.ajax({
      url: requestUrl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
				// console.log(data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
	},
	componentDidMount: function() {
		this.loadContent();
		this.setState({ mounted: true });
	},
	componentWillUnmount: function() {
		this.setState({ mounted: false });
	},
	render: function() {
		if(this.state.data.results) {
			var titles = this.state.data.results.map(function(title, i) {
				if(i < 5) {

					var backDrop = 'http://image.tmdb.org/t/p/original' + title.backdrop_path;
					if(!title.name) {
						var name = title.original_title;
					} else {
						var name = title.name;
					}

					return (
						<Item key={title.id} title={name} score={title.vote_average} overview={title.overview} backdrop={backDrop} />
					);	

				}
			});	

		} else {
			var titles = '';
		}
		
		return (
			<div ref="titlecategory" className="TitleList" data-loaded={this.state.mounted}>
				<div className="Title">
					<h1>{this.props.title}</h1>
					<div className="titles-wrapper">
						{titles}
					</div>
				</div>
			</div>
		);
	}
});

// Title List Item
var Item = React.createClass({
	render: function() {
		return (
			<div className="Item" style={{backgroundImage: 'url(' + this.props.backdrop + ')'}} >
				<div className="overlay">
					<div className="title">{this.props.title}</div>
					<div className="rating">{this.props.score} / 10</div>
					<div className="plot">{this.props.overview}</div>
					<ListToggle />
				</div>
			</div>
		);
	}
});

// ListToggle
var ListToggle = React.createClass({
	getInitialState: function() {
		return({ toggled: false })
	},
	handleClick: function() {
		if(this.state.toggled === true) {
			this.setState({ toggled: false });
		} else {
			this.setState({ toggled: true });	
		}
		
	},
	render: function() {
		return (
			<div onClick={this.handleClick} data-toggled={this.state.toggled} className="ListToggle">
				<div>
					<i className="fa fa-fw fa-plus"></i>
					<i className="fa fa-fw fa-check"></i>
				</div>
			</div>
		);
	}
});



ReactDOM.render(
	<App />,
	document.getElementById('app')
);