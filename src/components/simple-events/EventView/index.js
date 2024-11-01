import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import {Icon} from 'react-fa';

require('./style.scss');

let eventViewOptions = ['upcoming', 'past', 'all'];

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

let EventView = (props) => (
	<ul className="view-options">
		{eventViewOptions.map(option => (
			<li
				className={props.currentView === option ? 'selected' : ''}
				key={option}
				onClick={() => props.onClick(option)}
			>{capitalizeFirstLetter(option)}</li>
		))}
	</ul>
);

export default EventView;