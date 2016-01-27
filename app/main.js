var React = require('react');
var ReactDOM = require('react-dom');

//import { Router, Route, Link, browserHistory } from 'react-router'
var Router = require('react-router').Router;
var Route = require('react-router').Route;
var IndexRoute = require('react-router').IndexRoute;
var MenuBar = require('./components/navigation/menubar.js');
var menuData = require('./components/navigation/menudata.json');

// var GameContent = require('./game/game.js');
var RandomDungeon = require('./game/game2.js');

const App = React.createClass({
    render: function () {
        return (
            <div>
                <nav className="light-blue darken-1"
                     role="navigation">
                    <MenuBar
                        items={menuData}/>,
                </nav>
                <div
                    className="container">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

const Index = React.createClass({
    render: function() {
        return (
            <h3>Index</h3>
        );
    }
});

const About = React.createClass({
    render: function () {
        return (
            <h3>About</h3>
        );
    }
});

const Game = React.createClass({
    render: function() {
        return (
            <RandomDungeon width={800} height={600} />
        );
    }
});

const NoMatch = React.createClass({
    render: function () {
        return (
            <h3>404 Not Found</h3>
        );
    }
});

ReactDOM.render((
    <Router>
        <Route path="/" component={App}>
            <IndexRoute component={Index} />
            <Route path="about" component={About} />
            <Route path="game" component={Game} />
            <Route path="*" component={NoMatch}/>

        </Route>
    </Router>
), document.getElementById('content'));
