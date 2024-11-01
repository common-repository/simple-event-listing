import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from 'react-fa';
import moment from 'moment';

require('./style.scss');

let EventList = (props) => props.simpleEvents ? (
	<ul>
		{props.simpleEvents.map(simpleEvent => (
			<li
				className={simpleEvent.status === 'draft' ? 'status-draft' : ''}
				key={`simpleEvent${simpleEvent.id}`}>
				<div className="date">
					<span className="month">{moment(simpleEvent.start_date).format('MMM')}</span>
					<span className="day">{moment(simpleEvent.start_date).format('D')}</span>
					<span className="year">{moment(simpleEvent.start_date).format('YYYY')}</span>
				</div>
				<div className="event-meta">
					<h3 dangerouslySetInnerHTML={{
			  		__html: simpleEvent.title.rendered
					}} />
					<div className="locale">{simpleEvent.locale}</div>
					<button
						className="btn-icn"
						title={'Edit ' + simpleEvent.title.rendered}
						onClick={() => {
							if (props.selected && props.selected.id === simpleEvent.id) {
								return props.onEdit(null);
							}
							return props.onEdit(simpleEvent);
						}}
					><Icon name="pencil"/></button>
					<button
						className="btn-icn"
						title={simpleEvent.status === 'draft' ? 'Publish Event' : 'Hide Event'}
						onClick={() => {
							if (simpleEvent.status === 'draft') {
								props.onShow(simpleEvent);
							} else {
								props.onHide(simpleEvent);
							}
						}}
					><Icon name={simpleEvent.status === 'draft' ? 'eye-slash' : 'eye'}/></button>
					<button
						className="btn-icn"
						title={'Edit ' + simpleEvent.title.rendered}
						onClick={() =>{
							if(confirm('Delete ' + simpleEvent.title.rendered + '?')) {
								props.onDelete(simpleEvent);
							};
						}}
						><Icon name="times"/></button>
				</div>
			</li>
		))}
	</ul>
) : null;

export default EventList;