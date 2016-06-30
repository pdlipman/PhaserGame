/**
 * Created by philiplipman on 1/13/16.
 */
var React = require('react');
var ReactDOM = require('react-dom');
var Link = require('react-router').Link;

var MenuItem = require('./menuitem.js');


var MenuBar = React.createClass({
    getInitialState: function() {
        return {
            activeMenuItemUid: ''
        };
    },

    setActiveMenuItem: function(uid) {
        this.setState({activeMenuItemUid: uid});
    },
    preventDefault: function(event) {
        event.preventDefault();
    },
    render: function() {
        var currentActiveMenuItemUid = this.state.activeMenuItemUid;

        var menuItems = this.props.items.map(function(menuItem) {

            return (
                <MenuItem
                    active={currentActiveMenuItemUid === menuItem.uid}
                    key={menuItem.uid}
                    uid={menuItem.uid}
                    text={menuItem.text}
                    url={menuItem.url}
                    classes={menuItem.classes}
                    onSelect={this.setActiveMenuItem}
                />
            );

        }, this);

        return (
            <div
                className={'nav-wrapper container'}
                >
                <Link
                    to={''}
                    className={'brand-logo black-text'}>{'philipLipman'}
                </Link>
                <ul className="right hide-on-small-and-down">
                    {menuItems}
                </ul>
            </div>
        );
    }
});

//ReactDOM.render(
//    <MenuBar items={menuData} />,
//    document.getElementById('navBar')
//);

module.exports = MenuBar;