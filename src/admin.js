import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import {AdminHeader, Button, Notice} from 'components/wp';
import WPAPI from 'wpapi';
import WP_API_Settings from 'WP_API_Settings';
import { Icon } from 'react-fa';
import EventForm from './components/simple-events/EventForm';
import EventList from './components/simple-events/EventList';
import Pagination from './components/simple-events/EventPagination';
import EventView from './components/simple-events/EventView';

require('./admin.scss');

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			currentPage: 1,
			totalPages: 1,
			totalEvents: 0,
			authError: false,
			simpleEvents: [],
			loading: true,
			currentEvent: {},
			addingEvent: false,
			viewType: 'upcoming'
		};

		this.hideEvent = this.hideEvent.bind(this);
		this.showEvent = this.showEvent.bind(this);
		this.deleteEvent = this.deleteEvent.bind(this);
		this.saveEvent = this.saveEvent.bind(this);
		this.handleEditClick = this.handleEditClick.bind(this);
		this.cancelEventAdd = this.cancelEventAdd.bind(this);
		this.changePage = this.changePage.bind(this);
		this.changeView = this.changeView.bind(this);
	}

	componentDidMount() {
		this.api = new WPAPI({
			endpoint: WP_API_Settings.root,
			nonce: WP_API_Settings.nonce
		});

		this.api.simpleEvents = this.api.registerRoute( 'wp/v2', 'simpleEvents/(?P<id>[\\d]+)', {
			params: ['status']
		});

		this.updateData();
	}

	hideEvent(simpleEvent) {
		this.api.simpleEvents()
			.id(simpleEvent.id)
			.update(Object.assign(simpleEvent, {
				status: 'draft'
			}))
			.then(result => {
				this.updateData();
				return result;
			})
	}

	showEvent(simpleEvent) {
		this.api.simpleEvents()
			.id(simpleEvent.id)
			.update(Object.assign(simpleEvent, {
				status: 'publish'
			}))
			.then(result => {
				this.updateData();
				return result;
			})
	}

	deleteEvent(simpleEvent) {
		this.api.simpleEvents()
			.id(simpleEvent.id)
			.delete()
			.then(result => {
				this.updateData();
				return result;
			})
	}

	saveEvent(simpleEvent) {
		const { currentEvent } = this.state;

		if (currentEvent && currentEvent.id) {
			return this.api.simpleEvents()
				.id(currentEvent.id)
				.update(Object.assign(simpleEvent, {
					status: 'publish'
				}))
				.then(result => {
					this.setState({
						currentEvent: null,
						addingEvent: false
					});
					this.updateData();
					return result;
				});
		}

		return this.api.simpleEvents()
			.create({
				title: simpleEvent.title,
				content: simpleEvent.content,
				locale: simpleEvent.locale,
				link: simpleEvent.link,
				start_date: simpleEvent.start_date,
				status: 'publish'
			})
			.then(result => {
				this.setState({
					currentEvent: null,
					addingEvent: false,
				});
				this.updateData();
				return result;
			});
	}

	handleEditClick(simpleEvent) {
		this.setState({
			currentEvent: simpleEvent,
			addingEvent: true,
		});
	}

	cancelEventAdd() {
		this.setState({
			currentEvent: {},
			addingEvent: false,
		});
	}

	changePage(page) {
		this.setState({ currentPage: page}, function() {
			this.updateData();
		});
	}

	changeView(newView) {
		this.setState({
			viewType: newView,
			addingEvent: false,
		}, function(){
			this.updateData();
		});
	}

	updateData() {
		this.api.simpleEvents()
			.status('any')
			.context('edit')
			.page(this.state.currentPage)
			.orderby('relevance')
			.search(this.state.viewType)
			.then(simpleEvents => {
				this.setState({
					loading: false,
					simpleEvents,
					totalPages: simpleEvents._paging ? simpleEvents._paging.totalPages : null,
					totalEvents: simpleEvents._paging ? simpleEvents._paging.total : null
				});
			})
			.catch(e => {
				this.setState({
					loading: false,
				});
				if (e.data && e.data.status === 400) {
					this.setState({
						authError: true
					});
				} else {
					console.error(e);
				}
			});
	}

	render() {
		let viewClass = this.state.addingEvent ? 'single-view' : 'list-view';
		let addButton = (
			<button
				className="btn"
				onClick={()=>this.handleEditClick({})}
				title="Add new event">
				<Icon name="plus"/> Add New
			</button>
		);
		let header = (
			<div className="app-header">
				<div className="app-title">
					<AdminHeader>Simple Event Listing</AdminHeader>
					<EventView
						onClick={this.changeView}
						currentView={this.state.viewType}/>
				</div>
				{addButton}
			</div>
		);
		let listing = this.state.simpleEvents.length ? (
			<EventList
				simpleEvents={this.state.simpleEvents}
				onEdit={this.handleEditClick}
				onHide={this.hideEvent}
				onShow={this.showEvent}
				onDelete={this.deleteEvent}
				selected={this.state.currentEvent}/>
		) : (
			<div>
				<p>
					No {this.state.viewType == 'upcoming' || this.state.viewType == 'past' ? this.state.viewType : ''} events found.
				</p>
				{this.state.viewType == 'upcoming' ? addButton : ''}
			</div>
		);

		let pagination = this.state.totalPages > 1 ? (
			<Pagination
				currentPage={this.state.currentPage}
				totalPages={this.state.totalPages}
				totalEvents={this.state.totalEvents}
				onChangePage={this.changePage}
			/>
			) : (
				null
			);


		if (this.state.authError) {
			return (
				<div className='simple-event-listing'>
					{header}
					<h2>Authentication Failure</h2>
					<p>You must be logged in to manage events</p>
				</div>
			);
		}

		if (this.state.loading) {
			return (
				<div className='simple-event-listing'>
					{header}
					<p>Loading Simple Events&hellip;</p>
				</div>
			);
		}

		return (
			<div className='simple-event-listing'>
				{header}
				<div className={'simple-event-listing-ui' + ' ' + viewClass}>
					<div className="event-list">
						{pagination}
						{listing}
						{pagination}
					</div>
					<EventForm
						simpleEvent={this.state.currentEvent}
						onSubmit={this.saveEvent}
						onCancel={this.cancelEventAdd}/>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById( 'simple_event_listing' )
);
