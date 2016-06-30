/**
 * Created by philiplipman on 1/13/16.
 */

var React = require('react');
var Link = require('react-router').Link;

var MenuItem = React.createClass({
    handleClick: function(event) {
        event.preventDefault();
        this.props.onSelect(this.props.uid);
    },
    render: function() {
        var activeClass = this.props.active ? 'active ' : '';
        for (var i = 0; i < this.props.classes.length; i++) {
            activeClass += this.props.classes[i] + ' ';
        }

        return (
            <li
                className={activeClass.trim()}
                onClick={this.handleClick}>
                    <Link
                        to={this.props.url}
                        className="black-text">{this.props.text}</Link>
            </li>

        );
    }
});

module.exports = MenuItem;